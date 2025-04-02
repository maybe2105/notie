# Notie

My personal notes test application with React, TypeScript, and a Nodejs Backend.

This is my attempt to build a full feature packages that can be easily deploy/run, with a somewhat working backend

## Project Structure

- `client/`: React + TypeScript frontend (Vite)
- `server/`: Express backend

## Decisions

1. Frontend stack is React + Typescript, powered by Vite
2. The requirements want to allow multiple users to edit a note in real-time, and handle conflict, after researching a bit i chose `sharedb` to handle real-time JSON document collaboration, with a simple `posgresql` as a DB to store notes
3. Choose `postcss` for css-module
4. Add `wouter` for routing, it's a 2.1kB routing library for react, very easy to use
