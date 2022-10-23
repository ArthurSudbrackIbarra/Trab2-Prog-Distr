FROM node:16.15.1
WORKDIR /home/trab-2-prog-distr
COPY . .
RUN npm install
CMD ["npm", "run", "run-as-node"]