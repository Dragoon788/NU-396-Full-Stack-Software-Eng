from ariadne import QueryType, MutationType, make_executable_schema, gql, ObjectType
from api.models import Post, Comment, User
from datetime import datetime
# from django.contrib.auth.models import User


type_defs = gql("""
    type User {
        id: ID!
        username: String!
        email: String!
    }
    type Comment {
        id: ID!
        content: String!
        author: User!
        created_at: String!
    }
    type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
        timestamp: String!
    }

    type Query {
        posts: [Post!]!
        getUsersPosts(username: String!): [Post!]!
        post(id: ID!): Post
        postComments(postID: ID!): [Comment!]!
        users: [User!]!
    }

    type Mutation {
        createPost(title: String!, content: String!, author_username: String!): Post!
        updatePost(id: ID!, title: String, content: String): Post!
        deletePost(id: ID!): Boolean!
        # Functionality to add later
        addComment(postID: ID!, content: String!, author_username: String!): Comment!
        # updateComment(id: ID!, content: String): Comment!
        # deleteComment(id: ID!): Boolean!
        createUser(username: String!, email: String!): User!
        # deleteUser(id: ID!): Boolean!
    }
    
""")

query = QueryType()
mutation = MutationType()
post = ObjectType("Post")

# Query resolvers
@query.field("posts")
def resolve_posts(_, info):
    return Post.objects.all()

@query.field("post")
def resolve_post(_, info, id):
    return Post.objects.get(pk=id)

@query.field("postComments")
def resolve_post_comments(_, info, postID):
    return Comment.objects.filter(post_id=postID)

@query.field("users")
def resolve_users(_, info):
    return User.objects.all()

@query.field("getUsersPosts")
def resolve_get_users_posts(_, info, username):
    return Post.objects.filter(author__username=username)

@post.field("timestamp")
def resolve_post_timestamp(obj, info):
    return obj.timestamp.strftime("%#m/%#d/%y")
    

# Mutation resolvers
@mutation.field("createPost")
def resolve_create_post(_, info, title, content, author_username):
    try:
        user = User.objects.get(username=author_username)
    except User.DoesNotExist:
        raise Exception("User does not exist")
    return Post.objects.create(title=title, content=content, author=user)

@mutation.field("updatePost")
def resolve_update_post(_, info, id, title=None, content=None):
    post = Post.objects.get(pk=id)
    if title:
        post.title = title
    if content:
        post.content = content
    post.save()
    return post

@mutation.field("deletePost")
def resolve_delete_post(_, info, id):
    post = Post.objects.get(pk=id)
    post.delete()
    return True

@mutation.field("addComment")
def resolve_add_comment(_, info, postID, content, author_username):
    try:
        user = User.objects.get(username=author_username)
        post = Post.objects.get(pk=postID)
    except User.DoesNotExist:
        raise Exception("User does not exist")
    except Post.DoesNotExist:
        raise Exception("Post does not exist")
    return Comment.objects.create(content=content, author=user, post=post)

@mutation.field("createUser")
def resolve_create_user(_, info, username, email):
    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            raise Exception("Username already taken")
        if User.objects.filter(email=email).exists():
            raise Exception("Email already registered")
        
        # Create new user
        user = User.objects.create(username=username, email=email)
        return user
    except Exception as e:
        raise Exception(str(e))

schema = make_executable_schema(type_defs, [query, mutation, post])
