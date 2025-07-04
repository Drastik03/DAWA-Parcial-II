#docker build -t dawa_ws_image:latest .

FROM python:3.12
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
    tzdata
WORKDIR /app/dawa
COPY . /app/dawa
EXPOSE 1005
RUN pip3 --no-cache-dir install -r src/utils/requirements.txt
CMD ["python3", "app.py"]
