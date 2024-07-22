import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "./config";

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState({
    completed: false,
    notCompleted: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      // .get(`${API_URL}/v1/questions`)
      .get("https://35.198.254.147/v1/questions")
      .then((response) => {
        setProblems(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the problems!", error);
      });
  }, []);

  const topicsList = problems.map((problem) => problem.topic.toLowerCase());
  const uniqueTopics = new Set(topicsList);
  const topicArr = [...uniqueTopics].map((topic) => {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  });

  const difficultyList = problems.map((problem) =>
    problem.difficulty.toLowerCase()
  );
  const uniqueDifficulties = new Set(difficultyList);
  const difficultyArr = [...uniqueDifficulties].map((diff) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  });

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title?.toLowerCase().includes(searchTerm?.toLowerCase() ?? "") ||
      (problem.description
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase() ?? "") &&
        (difficulty === "all" || problem.difficulty === difficulty) &&
        (category === "all" || problem.topic === category) &&
        ((!status.completed && !status.notCompleted) ||
          (status.completed && problem.status === "completed") ||
          (status.notCompleted && problem.status !== "completed")))
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col space-y-4 items-center">
      <h1 className="text-2xl font-semibold text-white">Problems</h1>

      <div className="flex">
        <button
          id="dropdown-button-1"
          data-dropdown-toggle="topicDropdown"
          className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600"
          type="button"
        >
          All Topics{" "}
          <svg
            className="w-2.5 h-2.5 ms-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <div
          id="topicDropdown"
          className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 block"
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdown-button-1"
          >
            {topicArr.map((topic) => (
              <li key={topic}>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  {topic}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          id="dropdown-button"
          data-dropdown-toggle="difficultyDropdown"
          className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white dark:border-gray-600"
          type="button"
        >
          All Difficulties{" "}
          <svg
            className="w-2.5 h-2.5 ms-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <div
          id="difficultyDropdown"
          className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 block"
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdown-button-1"
          >
            {difficultyArr.map((diff) => (
              <li key={diff}>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  {diff}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-full">
          <input
            type="search"
            id="search-dropdown"
            className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
            placeholder="Search Problems"
            onChange={handleSearchChange}
            required
          />
        </div>
      </div>

      <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4"></div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 text-white">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Topic
              </th>
              <th scope="col" className="px-6 py-3">
                Difficulty
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem, index) => {
              let problemTopic = problem.topic.toLowerCase();
              problemTopic =
                problemTopic.charAt(0).toUpperCase() + problemTopic.slice(1);
              let problemDifficulty = problem.difficulty.toLowerCase();
              problemDifficulty =
                problemDifficulty.charAt(0).toUpperCase() +
                problemDifficulty.slice(1);
              const colourMap = {
                Hard: "text-red-500",
                Medium: "text-yellow-500",
                Easy: "text-green-500",
              };

              return (
                <tr key={index} className="border-b ">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                  >
                    <a
                      href={`/problem/${problem.id}`}
                      className="block text-sm text-blue-400 hover:text-blue-600"
                    >
                      {problem.title}
                    </a>
                  </th>
                  <td className="px-6 py-4">{problemTopic}</td>
                  <td className={`px-6 py-4 ${colourMap[problemDifficulty]}`}>
                    {problemDifficulty}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={problem.status === "completed"}
                      readOnly
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
