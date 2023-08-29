import React, { useState } from 'react';


interface QuestionChallengeProps{
  question:string
  options:string[]
  handleSubmit:(data:any) => Promise<void>
}

// QuestionChallenge.js
export default function QuestionChallenge ({question,options,handleSubmit}:QuestionChallengeProps) {
  const [displaySubmitButton, setDisplaySubmitButton] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  if(question && options && options.length > 0){
    return (
      <>
      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <h2 className='text-xl font-semibold'>Question Challenge</h2>
        <div className="sm:flex sm:items-start">
          <div>
            <p>{question}</p>
            <ul>
              {options.map((option, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      onChange={(e) => {setSelectedAnswer(e.target.value); setDisplaySubmitButton(true);}}
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        {displaySubmitButton && selectedAnswer!='' && (
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            onClick={async () => await handleSubmit(selectedAnswer)}
          >
            Submit
          </button>
        )}
      </div>

      </>
    );
  }
  return (<p>Some Error Occurred!!!</p>)
 
};