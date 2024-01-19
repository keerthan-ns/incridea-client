import Event from "@/src/components/event";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { PublishedEventsDocument, PublishedEventsQuery } from "@/src/generated/generated";
import { client } from "@/src/lib/apollo";

const Events: NextPage<{ data: PublishedEventsQuery['publishedEvents'] }> = ({
  data,
}) => {
  const branchFilters = [
    "ALL",
    "CORE",
    "CSE",
    "ISE",
    "AIML",
    "CCE",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
    "BTE",
  ];

  const dayFilters = ["ALL", "DAY 1", "DAY 2", "DAY 3", "DAY 4"];
  const categoryFilters = ["ALL", "TECHNICAL", "NON_TECHNICAL", "CORE"];
  const [currentBranchFilter, setCurrentBranchFilter] =
    useState<typeof branchFilters[number]>("ALL");
  const [currentDayFilter, setCurrentDayFilter] =
    useState<typeof dayFilters[number]>("ALL");
  const [currentCategoryFilter, setCurrentCategoryFilter] =
    useState<typeof branchFilters[number]>("ALL");
  const [query, setQuery] = useState("");

  const [filteredEvents, setFilteredEvents] = useState(data || []);

  const [showTopButton, setShowTopButton] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let tempFilteredEvents = data;
    if (currentBranchFilter !== "ALL")
      tempFilteredEvents = tempFilteredEvents.filter(
        (event) => event.branch.name === currentBranchFilter
      );
    if (currentDayFilter !== "ALL") {
      let filteredDay = new Date(
        currentDayFilter === "DAY 1"
          ? "2023-04-26"
          : currentDayFilter === "DAY 2"
          ? "2023-04-27"
          : currentDayFilter === "DAY 3"
          ? "2023-04-28"
          : "2023-04-29"
      ).getDate();
      tempFilteredEvents = tempFilteredEvents.filter((event) =>
        event.rounds.some((round) => new Date(round.date).getDate() === filteredDay)
      );
    }
    if (currentCategoryFilter !== "ALL") {
      tempFilteredEvents = tempFilteredEvents.filter(
        (event) => event.category === currentCategoryFilter
      );
    }
    setFilteredEvents(tempFilteredEvents);
  }, [currentBranchFilter, currentDayFilter, currentCategoryFilter, data]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentBranchFilter("ALL");
    setCurrentDayFilter("ALL");
    setCurrentCategoryFilter("ALL");
    if (e.target.value === "") {
      setFilteredEvents(data || []);
    } else {
      setFilteredEvents(
        data.filter((event) =>
          event.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }
  };

  //TODO: Add reset filter button on mobile
  const resetFilters = () => {
    setQuery("");
    setCurrentBranchFilter("ALL");
    setCurrentDayFilter("ALL");
    setCurrentCategoryFilter("ALL");
    setFilteredEvents(data || []);
  };

  return (
    <div>

    </div>
  );
};

export async function getStaticProps() {
  try {
    const { data: events } = await client.query({
      query: PublishedEventsDocument,
      fetchPolicy: 'no-cache',
    });

    return {
      props: {
        data: events.publishedEvents,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        data: [],
      },
      revalidate: 60,
    };
  }
}
export default Events;
