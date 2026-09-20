FROM fitai-trainer-ai-service:latest
RUN pip install --no-cache-dir opencv-python-headless
WORKDIR /app
CMD ["python", "ml/scripts/train_thai_food_classifier.py"]
