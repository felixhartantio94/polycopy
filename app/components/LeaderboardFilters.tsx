'use client';

import { Select, Button, Modal, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface LeaderboardFiltersProps {
  timePeriod: string;
  category: string;
  searchQuery: string;
  isSearchModalOpen: boolean;
  categoryLabels: { [key: string]: string };
  onTimePeriodChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearchModalOpen: (open: boolean) => void;
}

export default function LeaderboardFilters({
  timePeriod,
  category,
  searchQuery,
  isSearchModalOpen,
  categoryLabels,
  onTimePeriodChange,
  onCategoryChange,
  onSearchQueryChange,
  onSearchModalOpen,
}: LeaderboardFiltersProps) {
  return (
    <>
      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 flex-nowrap md:justify-end">
        {/* Time Period Dropdown - Compact */}
        <Select
          value={timePeriod}
          onChange={onTimePeriodChange}
          size="small"
          className="w-[80px]"
          options={[
            { value: 'DAY', label: '1D' },
            { value: 'WEEK', label: '7D' },
            { value: 'MONTH', label: '30D' },
            { value: 'ALL', label: 'All' }
          ]}
        />

        {/* Category Dropdown - Compact */}
        <Select
          value={category}
          onChange={onCategoryChange}
          size="small"
          className="w-[160px]"
          options={Object.entries(categoryLabels).map(([value, label]) => ({
            value,
            label
          }))}
        />
        
        {/* Search Button - Opens Modal */}
        <Button
          icon={<SearchOutlined />}
          onClick={() => onSearchModalOpen(true)}
          size="small"
          className="flex-1 md:flex-none"
        >
          Search
        </Button>
      </div>

      {/* Search Modal */}
      <Modal
        title="Search by name"
        open={isSearchModalOpen}
        onCancel={() => onSearchModalOpen(false)}
        footer={null}
        width={400}
      >
        <Input
          placeholder="Search by name"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          size="large"
          autoFocus
          onPressEnter={() => onSearchModalOpen(false)}
        />
      </Modal>
    </>
  );
}

