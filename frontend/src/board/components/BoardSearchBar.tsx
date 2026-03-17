import { useEffect, useState, type FormEvent } from 'react';
import { pageUi } from '../pages/pageUi';

interface BoardSearchBarProps {
  keyword: string;
  onSearch: (keyword: string) => void;
  onReset: () => void;
}

export default function BoardSearchBar({
  keyword,
  onSearch,
  onReset,
}: BoardSearchBarProps) {
  const [value, setValue] = useState(keyword);

  useEffect(() => {
    setValue(keyword);
  }, [keyword]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={pageUi.searchForm}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="검색어를 입력하세요"
        style={pageUi.input}
      />
      <button type="submit" style={pageUi.buttonPrimary}>
        검색
      </button>
      <button type="button" onClick={onReset} style={pageUi.buttonGhost}>
        초기화
      </button>
    </form>
  );
}
