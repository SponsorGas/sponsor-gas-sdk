import React from "react";

export default function HorizontalLoading(){
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-bounce flex items-center space-x-2">
          <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
          <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
          <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  };
  