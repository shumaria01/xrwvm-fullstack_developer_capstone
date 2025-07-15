from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .restapis import get_request, analyze_review_sentiments, post_review
from .populate import initiate
from .models import CarMake, CarModel
import logging
import json

# Logger
logger = logging.getLogger(__name__)


def get_cars(request):
    if CarMake.objects.count() == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [
        {"CarModel": cm.name, "CarMake": cm.car_make.name}
        for cm in car_models
    ]
    return JsonResponse({"CarModels": cars})


@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        login(request, user)
        data["status"] = "Authenticated"
    return JsonResponse(data)


def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']
    try:
        User.objects.get(username=username)
        return JsonResponse({
            "userName": username,
            "error": "Already Registered"
        })
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )
        login(request, user)
        return JsonResponse({
            "userName": username,
            "status": "Authenticated"
        })


# ✅ Updated for all dealerships and filtered by state
@csrf_exempt
def get_dealerships(request, state="All"):
    endpoint = "/fetchDealers" if state == "All" else f"/fetchDealers/{state}"
    dealerships = get_request(endpoint)
    print("DEBUG >>> Dealerships returned from cloud function:", dealerships)  # 👈 Add this

    return JsonResponse({"status": 200, "dealers": dealerships})



# ✅ Individual dealer by ID
@csrf_exempt
def get_dealer_details(request, dealer_id):
    try:
        endpoint = f"/fetchDealer/{dealer_id}"
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    except Exception as e:
        logger.error(f"Failed to fetch dealer details: {e}")
        return JsonResponse({"status": 500, "error": str(e)})


@csrf_exempt
def add_review(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            logger.info("Review submission data: %s", json.dumps(data, indent=2))
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as e:
            logger.error("Review post failed: %s", str(e))
            return JsonResponse({
                "status": 500,
                "message": f"Error in posting review: {str(e)}"
            })
    return JsonResponse({"status": 405, "message": "Method Not Allowed"})

@csrf_exempt
def get_dealer_reviews(request, dealer_id):
    try:
        endpoint = f"/fetchReviews/dealer/{dealer_id}"
        reviews = get_request(endpoint)

        for review_detail in reviews:
            try:
                review_text = review_detail.get("review", "")
                response = analyze_review_sentiments(review_text)
                review_detail['sentiment'] = (
                    response.get('label', 'neutral') if response else 'neutral'
                )
            except Exception as e:
                logger.warning(f"Sentiment analysis failed: {e}")
                review_detail['sentiment'] = 'neutral'

        return JsonResponse({"status": 200, "reviews": reviews})

    except Exception as e:
        logger.error(f"Error fetching dealer reviews: {e}")
        return JsonResponse({"status": 500, "error": str(e)})
