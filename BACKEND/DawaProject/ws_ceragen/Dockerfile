FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app/dawa

COPY src/utils/requirements.txt ./src/utils/requirements.txt
RUN pip install --no-cache-dir -r src/utils/requirements.txt

COPY . .

EXPOSE 5500

CMD ["python", "-m", "app"]
