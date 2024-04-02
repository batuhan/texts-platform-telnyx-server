# Platform Remote Telnyx Server

This is the server side code of the remote Telnyx webhook integration for Texts. 
Built with https://github.com/batuhan/texts-platform-remote-server-boilerplate

Client side code at https://github.com/batuhan/texts-platform-remote-telnyx

## Prerequisites

Before you begin. ensure you have the following installed.

- [Node.js](https://nodejs.org/en)

## How to install

- Clone this repository and navigate into the project directory:
```bash
git clone https://github.com/batuhan/texts-platform-telnyx-server.git && cd texts-platform-telnyx-server
```
- Create an .env file with the following for a postgres db
```
DATABASE_URL=
PORT=
```
- Install dependencies and build the project:
```bash
npm install
npm build
```
- Start the server
```bash
npm start
```

## How It Works

This implementation provides a webhook endpoint for Telnyx to send its webhook events to. Any webhook event sent to this route is then added to a thread called Telnyx Events. These events then can be viewed by the client in the Texts app using [Platform Remote Telnyx](https://github.com/batuhan/texts-platform-remote-telnyx). 

## Credits

This integration was built at [Pickled Works](https://pickled.works/) by [@alperdegre](https://github.com/alperdegre/) and it isn't an official integration by Texts.
