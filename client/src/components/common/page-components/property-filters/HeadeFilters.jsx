import React from 'react';
import { FaList } from 'react-icons/fa';
import { FiFilter, FiGrid } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { openFilterMenu } from '../../../../redux/features/uiSlice';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * HeadeFilters
 * @param {string} layout - The layout to show the properties in, either 'grid' or 'list'
 * @param {function} setLayout - Function to change the layout
 * @param {number} currentPage - The current page number
 * @param {number} itemsPerPage - The number of items shown per page
 * @param {number} totalItems - The total number of items
 *
 * @returns A JSX element with the filters and pagination
 */
/*******  f596cd6a-aee5-48db-ac3d-588056012e94  *******/ const HeadeFilters = ({
  layout,
  setLayout,
  currentPage,
  itemsPerPage,
  totalItems,
}) => {
  const dispatch = useDispatch();

  const startIndex = currentPage * itemsPerPage + 1;
  const endIndex = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div className="flex-col gap-4 flex-center-between md:flex-row">
      <div className="w-full flex-center-between">
        <div className="gap-2 flex-align-center">
          <div
            className={`w-10 h-10 rounded-xl grid place-items-center bg-slate-100 hover:bg-slate-200 sm:cursor-pointer transition-a dark:bg-card-dark ${
              layout === 'grid' && '!bg-primary text-white'
            }`}
            onClick={() => setLayout('grid')}
          >
            <FiGrid />
          </div>
          <div
            className={`w-10 h-10 rounded-xl grid place-items-center bg-slate-100 sm:cursor-pointer hover:bg-slate-200 transition-a dark:bg-card-dark ${
              layout === 'list' && '!bg-primary text-white'
            }`}
            onClick={() => setLayout('list')}
          >
            <FaList />
          </div>
          <div
            className="grid w-10 h-10 md:hidden rounded-xl place-items-center bg-slate-100 sm:cursor-pointer hover:bg-slate-200 transition-a dark:bg-card-dark"
            onClick={() => dispatch(openFilterMenu())}
          >
            <FiFilter />
          </div>
        </div>
        <p>
          Showing {startIndex} - {endIndex} of {totalItems} results
        </p>
      </div>
      <div className="w-full gap-4 flex-center-between">
        <select
          name=""
          id=""
          className="w-full px-3 py-2 bg-white border outline-none dark:border-dark dark:bg-main-dark"
        >
          <option value="">Sort by</option>
          <option value="latest">Latest</option>
          <option value="cheapest">Cheapest</option>
          <option value="expensive">Expensive</option>
        </select>
        <input
          type="text"
          className="border outline-none bg-transparent dark:border-dark px-3 py-[0.35rem] w-full"
          placeholder="Enter Keywords.."
        />
      </div>
    </div>
  );
};

export default HeadeFilters;
