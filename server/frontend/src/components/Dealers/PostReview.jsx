import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const root_url = window.location.origin + "/";
  const dealer_url = `${root_url}djangoapp/dealer/${id}`;
  const review_url = `${root_url}djangoapp/add_review`;
  const carmodels_url = `${root_url}djangoapp/get_cars`;

  const getFullName = () => {
    const first = sessionStorage.getItem("firstname");
    const last = sessionStorage.getItem("lastname");
    const username = sessionStorage.getItem("username");
    if (!first || !last || first === "null" || last === "null") return username;
    return `${first} ${last}`;
  };

  const postReview = async () => {
    if (!model || !review || !date || !year) {
      alert("All fields are required.");
      return;
    }

    const [car_make, car_model] = model.split(" ");

    const payload = {
      name: getFullName(),
      dealership: id,
      review: review,
      purchase: true,
      purchase_date: date,
      car_make: car_make,
      car_model: car_model,
      car_year: year
    };

    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 200) {
        navigate(`/dealer/${id}`);
      } else {
        alert("Failed to post review.");
      }
    } catch (error) {
      console.error("Post Review Error:", error);
      alert("An error occurred while posting the review.");
    }
  };

  const fetchDealer = async () => {
    const res = await fetch(dealer_url);
    const data = await res.json();
    if (data.status === 200 && Array.isArray(data.dealer) && data.dealer.length > 0) {
      setDealer(data.dealer[0]);
    }
  };

  const fetchCarModels = async () => {
    const res = await fetch(carmodels_url);
    const data = await res.json();
    if (Array.isArray(data.CarModels)) {
      setCarmodels(data.CarModels);
    }
  };

  useEffect(() => {
    fetchDealer();
    fetchCarModels();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>

        <textarea
          placeholder="Write your review..."
          cols="50"
          rows="7"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="input_field">
          Purchase Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="input_field">
          Car Make & Model:
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="" disabled>Choose Car Make and Model</option>
            {carmodels.map((carmodel, index) => (
              <option key={index} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year:
          <input
            type="number"
            min="2015"
            max="2025"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <button className="postreview" onClick={postReview}>
          Post Review
        </button>
      </div>
    </div>
  );
};

export default PostReview;
