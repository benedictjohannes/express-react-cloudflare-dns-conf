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

Create `.env` file following `example.env` and edit it to your Cloudflare credentials.

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
