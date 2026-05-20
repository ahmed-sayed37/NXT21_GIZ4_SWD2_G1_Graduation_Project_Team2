import React from "react";

export default function CommentCard({ comments, staticImage }) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <img
          onError={(e) => {
            e.target.src = staticImage;
          }}
          src={`${comments.commentCreator.photo}`}
          alt="User Avatar"
          className="w-6 h-6 rounded-full"
        />
        <div>
          <p className="text-gray-800 font-semibold">
            {comments.commentCreator.name}
          </p>
          <p className="text-gray-500 text-sm">{comments.content}</p>
        </div>
      </div>
    </>
  );
}
