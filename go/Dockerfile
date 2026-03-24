FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY internal/ ./internal/
COPY go/ ./go/
RUN go build -o rps ./go/

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/rps ./
COPY go/style.css ./

EXPOSE 8080

CMD ["./rps"]
