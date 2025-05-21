# Oddbit Player

Dashboard to stream multiple static video stored on and from custom backend server with custom video player.

## Run Locally

Clone the project

```bash
  git clone https://github.com/syirilrakhulh/oddbit-player.git
```

Go to the project directory

```bash
  cd oddbit-player
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run serve
```

## API Reference

#### Get all items

```http
  GET /api/video
```

| Query  | Type     | Description               |
| :----- | :------- | :------------------------ |
| `page` | `string` | Page number of video list |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `id`      | `string` | **Required**. Id of video to fetch |

#### Static Video

```
Put any video on apps/server/video.
```

## Tech Stack

**Client:** React, TailwindCSS, Vite

**Server:** Node, Express

**Tool:** Turborepo

## Screenshots

![Desktop Mode](https://drive.google.com/file/d/1EWNzBHFBzazMeeo36j53rB8ijLZqkrQ0/view?usp=sharing)

![Mobile Mode](https://drive.google.com/file/d/1EFPnXBa0nO56iyGBRldxM4cS6NLTR9fS/view?usp=sharing)

![Desktop Mode Fullscreen](https://drive.google.com/file/d/1fFKs96pUKL-0zqFt4l15yBeve9cXyjPg/view?usp=sharing)

![Mobile Mode Fullscreen](https://drive.google.com/file/d/1DBTG6gKO-5uUYsNnHVPlymauSKIBATUR/view?usp=sharing)
