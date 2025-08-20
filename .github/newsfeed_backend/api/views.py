from django.shortcuts import render

# Create your views here.

from ariadne.asgi import GraphQL
from api.graphql.schema import schema
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Newsfeed backend. Go to /graphql/ for GraphQL API.")

graphql_app = GraphQL(schema, debug=True)

