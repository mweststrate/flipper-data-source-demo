/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

export function Toolbar({
  active,
  setActive,
  search,
  setSearch,
  sorted,
  setSorted,
  sticky,
  setSticky,
}: {
  active: boolean;
  setActive(v: boolean): void;
  search: string;
  setSearch(search: string): void;
  sorted: boolean;
  setSorted(v: boolean): void;
  sticky: boolean;
  setSticky(v: boolean): void;
}) {
  return (
    <div className="toolbar">
      <button onClick={() => setActive(!active)}>
        {active ? 'Stop' : 'Start'}
      </button>
      Filter by coin:
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}></input>
      <input
        type="checkbox"
        checked={sorted}
        onChange={() => setSorted(!sorted)}
      />
      Sort by price
      <input
        type="checkbox"
        checked={sticky}
        onChange={() => setSticky(!sticky)}
      />
      Tail
    </div>
  );
}
