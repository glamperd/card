project=$(shell cat package.json | grep '"name":' | awk -F '"' '{print $$4}' | tr -d '-')
registry=docker.io/connextproject
prod_image=$(registry)/$(project)
cwd=$(shell pwd)
card=$(cwd)
proxy=$(cwd)/ops/proxy
flags=.makeflags
VPATH=build:$(flags)
version=$(shell cat package.json | grep '"version":' | egrep -o '[.0-9]+')
find_options=-type f -not -path "node_modules/*" -not -name "*.swp" -not -path "*/.*"
src=$(shell find src $(find_options))

# Setup docker run time
# If on Linux, give the container our uid & gid so we know what to reset permissions to
# On Mac the docker-VM takes care of this for us so pass root's id (noop)
my_id=$(shell id -u):$(shell id -g)
id=$(shell if [[ "`uname`" == "Darwin" ]]; then echo 0:0; else echo $(my_id); fi)
docker_run=docker run --name=$(project)_builder --tty --rm --volume=$(card):/root $(project)_builder $(id)

install=npm install --prefer-offline --unsafe-perm
log_start=@echo "============="; echo "[Makefile] => Start building $@"; date "+%s" > .makeflags/timestamp
log_finish=@echo "[Makefile] => Finished building $@ in $$((`date "+%s"` - `cat .makeflags/timestamp`)) seconds"; echo "============="; echo

$(shell mkdir -p build .makeflags)

########################################
# Begin Shortcut Rules
.PHONY: default all dev prod stop clean purge push push-live

default: dev
all: dev prod
dev: node-modules proxy
prod: proxy-prod

start: dev
	bash ops/deploy.dev.sh

start-prod: prod
	bash ops/deploy.prod.sh

stop:
	bash ops/stop.sh

clean: stop
	rm -rf $(flags)/*

deep-clean: clean
	rm -rf build/*

purge: deep-clean
	rm -rf node_modules/*

push: proxy-prod
	docker tag daicard:latest $(prod_image):latest
	docker push $(prod_image):latest

push-live:
	docker tag daicard:latest $(prod_image):$(version)
	docker push $(prod_image):$(version)

########################################
# Begin Tests

test: test-default
test-default: test-e2e
test-e2e: node-modules prod

########################################
# Begin Real Rules

proxy-prod: card-prod ops/proxy/prod.dockerfile
	$(log_start)
	docker build --file ops/proxy/prod.dockerfile --tag daicard:latest .
	$(log_finish) && touch $(flags)/$@

proxy: env node-modules ops/proxy/dev.dockerfile
	$(log_start)
	docker build --file ops/proxy/dev.dockerfile --tag $(project)_proxy:dev .
	$(log_finish) && touch $(flags)/$@

card-prod: prod-env node-modules $(src)
	$(log_start)
	$(docker_run) "npm run build"
	$(log_finish) && touch $(flags)/$@

node-modules: builder package.json
	$(log_start)
	$(docker_run) "$(install)"
	$(log_finish) && touch $(flags)/$@

builder:
	$(log_start)
	docker build --file ops/builder.dockerfile --tag $(project)_builder:latest .
	$(log_finish) && touch $(flags)/$@

prod-env: ops/dev.env
	$(log_start)
	cp -f ops/prod.env .env
	$(log_finish) && touch $(flags)/$@

env: ops/dev.env
	$(log_start)
	cp -f ops/dev.env .env
	$(log_finish) && touch $(flags)/$@
