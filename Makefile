build:
  docker build -t vaselgptbot .

run:
  docker run -d -p 3000:3000 --name vaselgptbot --rm vaselgptbot

stop:
  docker stop vaselgptbot