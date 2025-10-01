"""
Simple YT ChatBot Backend API - Exact Copy from Jupyter Notebook
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set the API key for Google AI
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "AIzaSyCgYhnQvRLAHecNxiXi3_WEIsJqifAxGMc")

# Exact imports from your notebook
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    video_id: str
    temperature: float = 0.2
    contextK: int = 4

# Store chains for each video
video_chains = {}

# Initialize embeddings model lazily when needed
embeddings = None

def get_embeddings():
    global embeddings
    if embeddings is None:
        print("🔧 Initializing HuggingFace embeddings model...")
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        print("✅ Embeddings model loaded successfully")
    return embeddings

prompt = PromptTemplate(
    template="""
        You are a helpful AI assistant.
        Answer Only from the provided transcript context.
        If the context is Insufficient, just say you don't know.

        {context}
        Question: {question}
    """,
    input_variables=["context", "question"]
)

def format_docs(retrieved_docs):
    context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
    return context_text

def create_chain_for_video(video_id: str, temperature: float = 0.2, contextK: int = 4):
    """Create the exact chain from your notebook"""
    try:
        print(f"Creating chain for video_id: {video_id}")
        
        # Step 1a - Get transcript (like your notebook)
        print("Getting transcript...")
        transcript_list = YouTubeTranscriptApi().fetch(video_id)
        print(f"Got transcript with {len(transcript_list.snippets)} snippets")
        
        # Convert to the format expected (like your notebook)
        transcript = []
        for snippet in transcript_list:
            transcript.append({
                "text": snippet.text,
                "start": snippet.start,
                "duration": snippet.duration
            })
        print(f"Converted to {len(transcript)} transcript items")
        
        # Step 1b - Text splitting (exact same)
        print("Splitting text...")
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        full_text = " ".join([t['text'] for t in transcript])
        chunks = splitter.create_documents([full_text])
        print(f"Created {len(chunks)} chunks")
        
        # Step 1c & 1d - Embeddings and Vector Store (exact same)
        print("Creating vector store...")
        embeddings_model = get_embeddings()
        vectorstore = FAISS.from_documents(chunks, embeddings_model)
        
        # Step 2 - Retrieval (exact same)
        print(f"Creating retriever with k={contextK}")
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": contextK})
        
        # Step 3 - LLM (exact same but with environment variable)
        print(f"Creating LLM with temperature={temperature}")
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp", 
            temperature=temperature,
            google_api_key=google_api_key
        )
        print("LLM created successfully")
        
        # Building the exact chain from your notebook
        print("Building chains...")
        parallel_chain = RunnableParallel({
            'context': retriever | RunnableLambda(format_docs),
            'question': RunnablePassthrough()
        })
        
        parser = StrOutputParser()
        main_chain = parallel_chain | prompt | llm | parser
        
        # Store the chain
        video_chains[video_id] = main_chain
        print(f"Chain created and stored successfully for video: {video_id}")
        return main_chain
        
    except TranscriptsDisabled:
        print("Error: Transcripts disabled for this video")
        raise HTTPException(status_code=404, detail="No captions available")
    except Exception as e:
        print(f"Error creating chain: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "YT ChatBot API Running!"}

@app.post("/api/chat")
def chat_with_video(request: ChatRequest):
    """Process question using exact chain from notebook"""
    try:
        print(f"Received request: question='{request.question[:50]}...', video_id='{request.video_id}', temp={request.temperature}, contextK={request.contextK}")
        
        # Special case for video analysis initialization
        if request.question == "analyze_video_init":
            print(f"Initializing video analysis for: {request.video_id}")
            # Just create the chain to initialize/analyze the video
            if request.video_id not in video_chains:
                create_chain_for_video(request.video_id, request.temperature, request.contextK)
            print("Video analysis initialization complete")
            return {"answer": "Video analysis complete! You can now ask questions about the content."}
        
        # Create or get chain for this video
        if request.video_id not in video_chains:
            print(f"Creating new chain for video: {request.video_id}")
            create_chain_for_video(request.video_id, request.temperature, request.contextK)
        else:
            print(f"Using existing chain for video: {request.video_id}")
        
        chain = video_chains[request.video_id]
        print(f"About to invoke chain with question: {request.question}")
        
        # Step 4 - Generation (exact same as notebook)
        answer = chain.invoke(request.question)
        print(f"Chain invoked successfully, answer length: {len(answer) if answer else 0}")
        
        return {"answer": answer}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in chat_with_video: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting YT ChatBot Backend Server...")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🔑 Google API Key loaded: {'✅' if os.getenv('GOOGLE_API_KEY') else '❌'}")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API endpoint: http://localhost:8000/api/chat")
    uvicorn.run(app, host="0.0.0.0", port=8000)