import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Nav/Navbar';
import CardSearch from '../components/card/CardSearch';
import axios from 'axios';
import SearchBox from '../components/searctbox/SearchBox';

function Searchpage() {
  const location = useLocation();
  const query = location.state?.query;
  const [searchResult, setsearchResult] = useState([]);

  useEffect(() => {
    const fetchSearch = async () => {
      const { data } = await axios(`http://localhost:5000/results?search_query=${query}`);
      setsearchResult(data);
      console.log(data);
    };
    if (query) {
      fetchSearch();
    }
  }, [query]);

  return (
    <>
      <Navbar />
      <SearchBox/>
      {!query ? (
        <p className="text-center mt-10 text-gray-500">กรุณากลับไปค้นหาก่อน ☕</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 pb-12">
          {searchResult.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">ไม่พบรายการที่ค้นหา ☕</p>
          ) : (
            searchResult.map((result, index) => (
              <CardSearch key={index} result={result} />
            ))
          )}
        </section>
      )}
    </>
  );
}

export default Searchpage;