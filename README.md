# TinyTap Games GPT in NodeJs

This repository hosts the TinyTap Games Plugin for ChatGPT, developed in NodeJs. It's an adaptation of a Python-based ChatGPT plugin, now available in NodeJs, allowing users to interact with TinyTap educational games. This plugin enables users to query and retrieve educational games from TinyTap, with filters for age, language, and more.

Get your ChatGPT plugin for TinyTap Games up and running in under 5 minutes using NodeJS. If you do not already have plugin developer access, please [join the waitlist](https://openai.com/waitlist/plugins). This plugin is designed following the best practices recommended by OpenAI.

For more information, read the [plugin documentation from OpenAI](https://platform.openai.com/docs/plugins/).

## Features

- Fetch a list of TinyTap educational games.
- Filter games by query, language, and age group.
- Retrieve game details including title, description, and images.

## TinyTap GameSmith - ChatGPT Integration

- [GameSmith GPT](https://chat.openai.com/g/g-gQr3Ots3d-tinytap-gamesmith)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/[YourUsername]/tinytap-games-plugin-node.git
cd tinytap-games-plugin-node
```

Install the required dependencies:
`npm install`

Running the project
For development:
`npm start`

Once the local server is running:

1. Navigate to https://chat.openai.com.
2. In the Model drop-down, select "Plugins".
3. Select "Plugin store".
4. Select "Develop your own plugin".
5. Enter localhost:5003 as the server URL, then select "Find manifest file".
6. The plugin should now be installed and enabled!

## API Endpoints

### Fetch Games

Method: GET
URL: ` /tinytap-games/:query`
URL Params: query (string)
Success Response: 200 OK with JSON object of games

### Fetch Games with Pagination

Method: GET
URL: `/tinytap-games/:query/:page/:count`
URL Params: query (string), page (string), count (string)
Success Response: 200 OK with JSON object of games

### Fetch Games with Filters

Method: GET
URL: `/tinytap-games/:query/:language/:age/:page/:count``
URL Params: query (string), language (string), age (string), page (string), count (string)
Success Response: 200 OK with JSON object of games

## Contributing

Contributions are welcome! Please create a fork of this repository, make your changes in a new branch, and submit a pull request.

## License

This project is licensed under the MIT License.

