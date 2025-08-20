Mini Design Doc: https://docs.google.com/document/d/1lTONNKNekpN8AyghF6hFeU27e5v3Do8zsbKh5S10t2U/edit?usp=sharing

Setup Instructions:
- Make sure to allow poetry to install the required dependencies in /.github/newsfeed_backend/pyproject.toml 

Backend:
- cd into .github/newsfeed_backend/
- run 'poetry run manage.py runserver' to start the backend server
- Open the link on a browser that runs http: (I had issues running on Chrome running https and instead ran on Microsoft Edge)

Frontend:
- cd into /.github/newsfeed_frontend/newsfeed-frontend/
- run 'npm run dev' in order to setup the frontend
- Create a User on the homepage
- Create a Post on the homepage

AI Documentation:

From this Project I learned how to utilize AI effectively in order to help in project creation. Both thorugh inefffective prompting and learning how to better use AI's abilities, I was able to learn that the best way to use AI is as a method to learn as well as way to chunk down the size of large documents into a concise and readable format. Lastly, I learned that AI is extremely powerful when prompting back to back thoughts and when grounding them as experts.

Example of backend usage for learning and setup:
ex: "This is my project doc for my course. Outline all the things I need to do and help me begin ideally with the backend since I don't know much about django, strawberry, and graphql:..."
ex: "I'm getting this background when I try to run my poetry add django ariadne line:... error message"
ex: "When I add this line to my urls.py I go from the default page from django to a page not found error.

    # path('graphql/', GraphQLView.as_view(schema=schema)),

Why is this happening? and here's my error:"


Example for frontend component creation
ex: "You are an expert in Next.js with component thinking in mind. Here is my project doc: ...
What are the mmain components needed for the frontend considering the functionality of my backend"

ex: "You are an expert in Next.js with component thinking in mind, help me design a skeleton for a Create Post form with this backend query in mind:

query{
  createPost ("Test", "This is content", jonkrasinski22){
    id
    title
    content
    author{
      id
      username
    }
  }

}
"

Example for CSS and Basic structure:
ex: "You are an expert in Next.js with component thinking in mind. Please create a skeleton structure to help me design a frontend applciation with similar functionality and appearance to Reddit and Twitter. Make sure to not include functionality for replies and voting as my project does not require."
ex: "Make this post creation form appear only when a button is clicked for create post"
