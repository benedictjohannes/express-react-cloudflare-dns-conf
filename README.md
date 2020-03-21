# Why? 

Cloudflare provides an advanced DNS service with great API support. Suppose you want to change your DNS entries, but you don't want to login to Cloudflare dashboard. This repo is one solution. This is a very simple way to quickly use Cloudflare API without `curl` or dedicated API client: Just one `yarn start` away. 

## Use case

I developed this for my own use to help in sharing resource from my laptop locally via LAN. Instead of having people type my local IP address, I can simply change some DNS entries (a subdomain I control) and have people easily access the more humane domain name to access my laptop (locally). 

# What's this?

This is a _very_ simple project aiming to make speedy adjustments to certain entries in Cloudflare DNS using Cloudflare API using Express backend to consume Cloudflare API and React frontend.

The project frontend was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) stripped to the bare minimum. The frontend dependencies was intentionally moved to devDependencies, because it's only necessary to create the `build` directory, which is compiled to the source code under `static` folder and will be served as static assets by Express.

# Usage

## Dependencies

To use this, you don't need to install `devDependencies`.

Just run

```
yarn --production
```

Note: this is developed and tested on Node 12.

## Configuration

Create `.env` file following `example.env` and edit it to your Cloudflare credentials. You will need your Cloudflare API key and Cloudflare account email address to  use this.

Two variables might be of interest:
- `ALLOW_LISTEN`: where the Node server listens to. Should only allow localhost, instead of local LAN networks you are connected to (security risk). Change to 0.0.0.0 to enable local computers to access at your own risk. Defaults to 127.0.0.1 (localhost).
- `BACKEND_PORT`: The port the app listens to. Frontend is included in this repo. Defaults to 23367 (CFDNS).
- `LAUNCH_BROWSER`: Automatically launch browser to open the front end when the backend starts listening. Defaults to TRUE.

## Running

`cd` into the project directory and run `yarn start`

# Front end development

If you want to develop the front end, React dependencies is moved into `devDependencies`. To install them you can simply run

```
yarn
```

and to run React in development mode, run

```
yarn startReact
```

If you build the front end using `yarn build`, the `build` folder takes precedence over `static` folder committed in this repo, such that you can build your own repo with `git` ignoring it. If you want to commit the static, you can run `yarn buildToCommit` (using Linux `rm` and `mv`, adjust accordingly).

The localhost port contacted by react is setup in `.env` on variable `REACT_APP_BACKEND_PORT` (only used in development mode). This port setting is second priority after `BACKEND_PORT`.