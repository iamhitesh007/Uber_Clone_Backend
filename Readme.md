Endpoint

URL: /api/v1/user/register
Method: POST

How to Send Request
To register a new user, send a POST request to the endpoint using a tool like Postman, cURL, or any HTTP client in your application.

Request Headers
Content-Type: application/json

Request Body
The request body should be a JSON object containing the following fields:

{
"fullName": {
"firstName": "string", // Required: Minimum 3 characters
"lastName": "string" // Optional: Minimum 3 characters
},
"email": "string", // Required: Must be a valid email format
"password": "string", // Required: Minimum 8 characters
"gender": "string" // Optional: Can be "male", "female", or "other"
}

How Data is Sent
The data is sent in the body of the POST request as a JSON object.
Ensure that the request body is properly formatted as JSON.

Response
Upon successful registration, the server will respond with a JSON object containing the following fields:

Success Response
Status Code: 201 Created
Response Body:

{
"status": "success",
"message": "User created successfully",
"data": {
"user": {
"fullName": {
"firstName": "string",
"lastName": "string"
},
"email": "string",
"gender": "string",
"createdAt": "date",
"updatedAt": "date"
},
"token": "string" // JWT token for authentication
}
}

Error Response
In case of validation errors or if the email is already in use, the server will respond with:

Status Code: 400 Bad Request
Response Body:

{
"errors": [
{
"msg": "Error message describing the issue",
"param": "field name",
"location": "body"
}
]
}

Summary
Send a POST request to /api/v1/user/register with the required JSON body.
Receive a success response with user details and a token or an error response with validation messages.
