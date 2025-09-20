🌾 AI-Driven Crop Yield Prediction System
🎯 Project Overview & Goal
This project leverages Machine Learning and real-time data to create a robust system for predicting crop yield and offering data-driven optimization recommendations to farmers. The primary goal is to enhance agricultural efficiency, improve decision-making regarding resources (fertilizers, water), and contribute to sustainable farming practices.

The model is designed to provide predictions well in advance of the harvest time, offering critical time for intervention and better storage/logistics planning.

✨ Key Features
Yield Prediction Model: Utilizes advanced regression algorithms (e.g., Random Forest, XGBoost) to forecast the yield (e.g., quintal/acre) for specified crops.

Multi-Factor Analysis: Inputs include essential agricultural and geospatial features:

Soil Nutrients (NPK): Based on user-selected soil type (Alluvial, Black, Red).

Geospatial Data: Uses current GPS location to fetch real-time and historical Weather Conditions (Temperature, Humidity, Rainfall).

Farm Metadata: Crop type, sowing date, and land area.

Optimization Recommendations: Provides actionable advice based on current farm inputs, such as nitrogen application suggestions or irrigation schedules, to maximize the predicted yield.

Intuitive Interface: A mobile-friendly web application developed with HTML, CSS, and modern JavaScript modules for easy farmer adoption.

🛠️ Technology Stack
Category	Technology	Purpose
Frontend	HTML5, CSS3	Structure and Styling
Client-Side Logic	Vanilla JavaScript (ES Modules)	Handles DOM manipulation, localization, and user flow.
Database	Supabase (PostgreSQL)	Data persistence for farmer profiles (using Phone Number as ID) and farm records.
External APIs	OpenWeatherMap Geocoding API	Fetching location-specific weather and state data.
ML Model	(Conceptual/Placeholder)	Placeholder for a trained regression model (e.g., Scikit-learn or TensorFlow model served via a Flask/API endpoint).
