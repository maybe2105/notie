# Notie

My personal notes test application with React, TypeScript, and a Nodejs Backend.

This is my attempt to build a full feature packages that can be easily deploy/run, with a somewhat working backend

## Project Structure

- `client/`: React + TypeScript frontend (Vite)
- `server/`: Express backend

## Journey

1. Frontend stack is React powered by Vite, since it's the most loved build tool in the frontend world right now, it's not as flexible as webpack but it can easily get the job done for most of the project
2. The requirements want to allow multiple users to edit a note in real-time, and handle conflict, after researching a bit i chose `sharedb` to handle real-time JSON document collaboration, with a simple `posgresql` as a DB to store notes
3. Choose `postcss` for css-module
4. Add `wouter` for routing, it's a 2.1kB routing library for react, very easy to use
