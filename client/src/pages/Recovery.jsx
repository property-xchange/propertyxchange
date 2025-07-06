import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../zustand/store';
import { generateOTP, verifyOTP } from '../helper/helper';
import { useNavigate } from 'react-router-dom';

export default function Recovery() {
  const navigate = useNavigate();
  const { username } = useAuthStore((state) => state.auth);
  const [OTP, setOTP] = useState();

  useEffect(() => {
    generateOTP(username).then((OTP) => {
      if (OTP) return toast.success('OTP has been sent to your email');
      return toast.error('Problem occur while generating your OTP');
    });
  }, [username]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      let { status } = await verifyOTP({ username, code: OTP });
      if (status === 201) {
        toast.success('Verify Successfully!');
        return navigate('/reset-password');
      }
    } catch (error) {
      return toast.error('Wrong OTP! Check your email again!');
    }
  }

  function resendOTP() {
    let sentPromise = generateOTP(username);

    toast.promise(sentPromise, {
      loading: 'Sending...',
      success: <b>OTP has been send to your email!</b>,
      error: <b>Could not send OTP!</b>,
    });

    sentPromise.then((OTP) => {
      console.log(OTP);
    });
  }

  return (
    <div className="p-3 max-w-lg mx-auto mt-[4rem]">
      <h1 className="text-3xl text-center font-semibold mt-7">Recovery</h1>
      <h3 className="text-xl text-center">Enter OTP to recover password</h3>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <div className="flex justify-center items-center mt-7">
            <span className="text-sm text-center mb-1">
              Enter 6 digit OTP sent to your email address
            </span>
          </div>
          <input
            type="text"
            placeholder="OTP"
            className="border p-3 rounded-lg input w-full"
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          />
        </div>

        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
          type="submit"
        >
          Recover
        </button>
      </form>
      <div className="flex mt-5">
        <div className="flex gap-2">
          <p>Can't get OTP?</p>
          <button
            className="text-blue-700 hover:text-primary transition-all duration-300"
            onClick={resendOTP}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}
