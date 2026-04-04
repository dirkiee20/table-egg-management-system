import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

def generate_feed_forecast(flock_id: str, db_session):
    from app.models import FeedConsumption
    
    # Fetch feed data
    feed_data = db_session.query(FeedConsumption).filter(FeedConsumption.flockId == str(flock_id)).all()
    if len(feed_data) < 5:
        # Not enough data for ML, return historical average or default fallback
        avg_feed = 120.0
        if len(feed_data) > 0:
            avg_feed = sum([x.feedConsumedKgs for x in feed_data]) / len(feed_data)
        return {
            "flockId": flock_id,
            "forecasts": [avg_feed] * 7,
            "method": "historical_average",
            "message": "Not enough data for ML. Using average."
        }
    
    # Prepare data for Linear Regression
    df = pd.DataFrame([{ "date": f.date, "feed": f.feedConsumedKgs } for f in feed_data])
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    
    # Use array index as days passed
    df["day_index"] = np.arange(len(df))
    
    X = df[["day_index"]].values
    y = df["feed"].values
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Forecast next 7 days
    last_day_index = df["day_index"].max()
    X_future = np.array([[last_day_index + i] for i in range(1, 8)])
    y_pred = model.predict(X_future)
    
    predictions = [max(0, float(pred)) for pred in y_pred]  # ensure no negative feed
    return {
        "flockId": flock_id,
        "forecasts": predictions,
        "method": "linear_regression",
        "message": "Forecast generated using Linear Regression"
    }
