# app/core/firebase.py
import os
from firebase_admin import credentials, initialize_app, firestore

# --------------------------
# Initialize Firebase
# --------------------------

FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH", "serviceAccount.json")

cred = credentials.Certificate(FIREBASE_CRED_PATH)
firebase_app = initialize_app(cred)
db = firestore.client(firebase_app)


# --------------------------
# Firestore Helper Functions
# --------------------------

def add_doc(collection: str, data: dict) -> str:
    """
    Add new document with auto-generated ID.
    Returns the generated document ID.
    """
    doc_ref = db.collection(collection).add(data)
    return doc_ref[1].id


def get_doc(collection: str, doc_id: str):
    doc = db.collection(collection).document(doc_id).get()
    return doc.to_dict() if doc.exists else None


def update_doc(collection: str, doc_id: str, data: dict):
    db.collection(collection).document(doc_id).update(data)
    return True


def delete_doc(collection: str, doc_id: str):
    db.collection(collection).document(doc_id).delete()
    return True


def query_docs(collection: str, filters: list = None):
    ref = db.collection(collection)

    if filters:
        for field, op, value in filters:
            ref = ref.where(field, op, value)

    return [
        {"id": d.id, **d.to_dict()}
        for d in ref.stream()
    ]
