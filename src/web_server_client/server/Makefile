.PHONY: dev install run logs build test clean deploy

dev:
	pipenv run start

install:
	pipenv install

run: build
	docker run -d --rm --name mybrainy -e FLASK_ENV=development -p 2769:3000 brainy:testv1

exec:
	docker exec -it mybrainy /bin/sh

logs:
	docker logs --follow mybrainy

build:
	pipenv run build

test:
	pipenv run test

clean:
	docker stop mybrainy

deploy:
	pipenv run deploy $(filter-out $@,$(MAKECMDGOALS))