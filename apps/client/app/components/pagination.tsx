import { cx } from 'class-variance-authority';
import { useMemo } from 'react';
import ChevronLeft from '~/assets/icons/chevron-left.svg?react';
import ChevronRight from '~/assets/icons/chevron-right.svg?react';
import Button from './button';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const Pagination = ({ totalPages, currentPage, handlePageChange }: PaginationProps) => {
  const pageNumbers = useMemo(() => {
    const pageNumbers = [];
    const maxPageButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }, [currentPage, totalPages]);

  return (
    <div className="space-4 mt-8 flex flex-col items-center justify-center md:flex-row md:justify-between">
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1">
          {/* Previous page button */}
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            variant="icon-only"
            disabled={currentPage === 1}
            className="text-black hover:!bg-black/10 focus-visible:!bg-black/10 disabled:text-gray-400"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* First page button */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant="icon-only"
                className="h-8 w-8 hover:!bg-black/10 focus-visible:!bg-black/10"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && <span className="px-2 py-1">...</span>}
            </>
          )}

          {/* Page number buttons */}
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant="icon-only"
              onClick={() => handlePageChange(pageNum)}
              className={cx(
                'h-8 w-8 hover:!bg-black/10 focus-visible:!bg-black/10',
                currentPage === pageNum ? 'bg-black/10' : '',
              )}
            >
              {pageNum}
            </Button>
          ))}

          {/* Last page button */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-2 py-1">...</span>}
              <Button
                variant="icon-only"
                className="h-8 w-8 hover:!bg-black/10 focus-visible:!bg-black/10"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next page button */}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            variant="icon-only"
            disabled={currentPage === totalPages}
            className="text-black hover:!bg-black/10 focus-visible:!bg-black/10 disabled:text-gray-400"
            aria-label="Next page"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Page info */}
      <div className="mt-4 text-center text-sm text-black md:mt-0 md:ml-auto">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
