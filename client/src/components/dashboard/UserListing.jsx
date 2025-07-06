import { useState, useEffect, Suspense } from 'react';
import Dashboard from './Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { closeFilterMenu, uiStore } from '../../redux/features/uiSlice';
import { Await, useLoaderData } from 'react-router-dom';
import {
  PropertyFullWidth,
  HeadeFilters,
  Pagination,
} from '../common/page-components';
import { PropertyList } from '../property';
import PropertyLoader from '../../components/common/PropertyLoader';

const UserListing = () => {
  const { postResponse } = useLoaderData();
  console.log(postResponse);
  const pageNumber = 18;
  const { isFilterMenuOpen } = useSelector(uiStore);
  const dispatch = useDispatch();
  const [layout, setLayout] = useState('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageProperties, setCurrentPageProperties] = useState([]);
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    if (postResponse && postResponse.data && postResponse.data.userListings) {
      setUserListings(postResponse.data.userListings);
      setCurrentPageProperties(
        postResponse.data.userListings.slice(0, pageNumber)
      );
    }
  }, [postResponse]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
    const startIndex = selected * pageNumber;
    const endIndex = Math.min(startIndex + pageNumber, userListings.length);
    setCurrentPageProperties(userListings.slice(startIndex, endIndex));
  };

  const handleCloseFiltermenu = (e) => {
    if (e.target.classList.contains('filter-modal')) {
      dispatch(closeFilterMenu());
    }
  };

  return (
    <Dashboard>
      <main className="p-3 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-center my-3 md:mb-7 mb-4 uppercase tracking-widest">
          Your Properties
        </h1>
        <div>
          <Suspense fallback={<PropertyLoader />}>
            <Await resolve={postResponse}>
              {() => {
                if (
                  !currentPageProperties ||
                  currentPageProperties.length === 0
                ) {
                  return <div>Error: No properties found.</div>;
                }
                return (
                  <>
                    <HeadeFilters
                      layout={layout}
                      setLayout={setLayout}
                      currentPage={currentPage}
                      itemsPerPage={pageNumber}
                      totalItems={userListings.length}
                    />
                    <div className="">
                      {currentPageProperties.length > 0 ? (
                        <>
                          {layout === 'grid' ? (
                            <PropertyFullWidth
                              properties={currentPageProperties}
                            />
                          ) : (
                            <PropertyList properties={currentPageProperties} />
                          )}
                          <Pagination
                            itemsPerPage={pageNumber}
                            pageData={currentPageProperties}
                            onPageChange={handlePageChange}
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-7">
                          <span className="text-2xl">
                            Oops!
                            <CgUnavailable className="inline" />
                          </span>
                          <p className="text-2xl">No property available</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </main>
    </Dashboard>
  );
};

export default UserListing;
