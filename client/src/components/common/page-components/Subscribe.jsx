import React from 'react';

const Subscribe = () => {
  return (
    <div className="flex-1 basis-[10rem] text-center md:text-left">
      <h2 className="text-xl font-semibold">Subscribe to our Newsletter</h2>
      <p className="text-sm text-muted">
        Subscribe to be the first one to know about updates. Enter your email
      </p>
      <div className="justify-center my-3 flex-align-center">
        <input
          type="text"
          className="px-4 py-[0.35rem] card-bordered dark:shadow-none outline-none bg-transparent rounded-lg border-dark"
          placeholder="Email Address.."
        />
        <button className="-ml-2 btn btn-primary">subscribe</button>
      </div>
    </div>
  );
};

export default Subscribe;
