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
import { CgUnavailable } from 'react-icons/cg';

const SaveProperty = () => {
  const { postResponse } = useLoaderData();
  const pageNumber = 18;
  const { isFilterMenuOpen } = useSelector(uiStore);
  const dispatch = useDispatch();
  const [layout, setLayout] = useState('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageProperties, setCurrentPageProperties] = useState([]);
  const [savedListings, setSavedListings] = useState([]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
    const startIndex = selected * pageNumber;
    const endIndex = Math.min(startIndex + pageNumber, savedListings.length);
    setCurrentPageProperties(savedListings.slice(startIndex, endIndex));
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
          Saved Properties
        </h1>
        <div>
          <Suspense fallback={<PropertyLoader />}>
            <Await resolve={postResponse}>
              {(resolvedData) => {
                console.log('Resolved saved data:', resolvedData);

                // Extract savedListings from the resolved data
                const listings = resolvedData?.data?.savedListings || [];

                // Update state when data is resolved
                useEffect(() => {
                  setSavedListings(listings);
                  setCurrentPageProperties(listings.slice(0, pageNumber));
                }, [listings]);

                if (!listings || listings.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center p-7">
                      <span className="text-2xl">
                        Oops!
                        <CgUnavailable className="inline ml-2" />
                      </span>
                      <p className="text-2xl">No saved properties found</p>
                    </div>
                  );
                }

                return (
                  <>
                    <HeadeFilters
                      layout={layout}
                      setLayout={setLayout}
                      currentPage={currentPage}
                      itemsPerPage={pageNumber}
                      totalItems={listings.length}
                    />
                    <div>
                      {currentPageProperties.length > 0 ? (
                        <>
                          {layout === 'grid' ? (
                            <PropertyFullWidth
                              properties={currentPageProperties}
                            />
                          ) : (
                            <PropertyList properties={currentPageProperties} />
                          )}
                          {listings.length > pageNumber && (
                            <Pagination
                              itemsPerPage={pageNumber}
                              pageData={listings}
                              onPageChange={handlePageChange}
                            />
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-7">
                          <span className="text-2xl">
                            Oops!
                            <CgUnavailable className="inline ml-2" />
                          </span>
                          <p className="text-2xl">No properties available</p>
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

export default SaveProperty;
