import React from 'react';
import RequestForm from '../forms/RequestForm';
import Dashboard from './Dashboard';
import { Link } from 'react-router-dom';

const DashboardRequest = () => {
  return (
    <Dashboard>
      <div className="flex justify-between mt-4 mb-6">
        <h1 className="text-2xl font-semibold">Request Property</h1>
        <Link className="btn btn-primary" to="/my-requests">
          Back to request list
        </Link>
      </div>
      <RequestForm />
    </Dashboard>
  );
};

export default DashboardRequest;
