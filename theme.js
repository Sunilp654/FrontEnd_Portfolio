// theme.js
const themeConfigs = {
    cyber: { primary: "#00f2fe", secondary: "#4facfe", star: 0x00f2fe },
    inferno: { primary: "#ff4757", secondary: "#ffa502", star: 0xff4757 },
    gold: { primary: "#ffd700", secondary: "#ff8c00", star: 0xffd700 }
};

function changeTheme(mode) {
    const config = themeConfigs[mode];

    gsap.to(":root", {
        "--neon-blue": config.primary,
        "--neon-purple": config.secondary,
        duration: 1.0
    });

    if (window.particles) {
        window.particles.forEach(p => {
            // Direct property animation to avoid internal 'instanceof' check
            gsap.to(p, {
                tint: config.star, 
                duration: 1.0,
                overwrite: 'auto'
            });
        });
    }
}

const originalInitParticles = window.initParticles;
window.initParticles = function(mode) {
    if(mode === 'neon') changeTheme('cyber');
    if(typeof originalInitParticles === 'function') originalInitParticles(mode);
};

//-----------------------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Col, Row, Container, Button } from "react-bootstrap";

function App() {
  const initialData = [
    {
      activityId: 1,
      activityName: "PRIME CONTRACT AWARD",
      assignedCompanies: [],
      startDate: "2026-01-16T08:00:00",
      endDate: "2026-01-26T17:00:00",
      status: "Not Assigned",
    },
    {
      activityId: 2,
      activityName: "Prime Contractor Selected",
      assignedCompanies: ["testing2", "Strafford Construction Group"],
      startDate: "2026-01-16T08:00:00",
      endDate: "2026-01-16T17:00:00",
      status: "Assigned",
    },
    {
      activityId: 3,
      activityName: "Prime",
      assignedCompanies: ["testing2", "contractar"],
      startDate: "2026-01-17T08:00:00",
      endDate: "2026-01-17T17:00:00",
      status: "Assigned",
    },
  ];

  const companylist = [
    { companyId: 2, companyName: "contractar" },
    { companyId: 3, companyName: "testing2" },
    { companyId: 5, companyName: "Strafford Construction Group" },
  ];

  const [activities, setActivities] = useState(initialData);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({
    company: "",
    activity: "",
  });

  const ref = useRef();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB");

  const getCompanyName = (id) =>
    companylist.find((c) => c.companyId == id)?.companyName;

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter
  const filteredData = useMemo(() => {
    const term = search.toLowerCase();

    return activities.filter((item) => {
      const combined = [
        item.activityId,
        item.activityName,
        item.status,
        formatDate(item.startDate),
        formatDate(item.endDate),
        item.assignedCompanies.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return combined.includes(term);
    });
  }, [search, activities]);

  // Toggle checkbox
  const handleToggle = (item) => {
    setSelectedActivities((prev) => {
      const exists = prev.find(
        (i) => i.activityId === item.activityId
      );
      if (exists) {
        return prev.filter(
          (i) => i.activityId !== item.activityId
        );
      } else {
        return [...prev, item];
      }
    });

    setErrors((prev) => ({ ...prev, activity: "" }));
  };

  // Select all
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((item) =>
      selectedActivities.some(
        (i) => i.activityId === item.activityId
      )
    );

  const handleSelectAll = (checked) => {
    if (checked) {
      const newItems = filteredData.filter(
        (item) =>
          !selectedActivities.some(
            (i) => i.activityId === item.activityId
          )
      );
      setSelectedActivities((prev) => [...prev, ...newItems]);
    } else {
      setSelectedActivities((prev) =>
        prev.filter(
          (i) =>
            !filteredData.some(
              (f) => f.activityId === i.activityId
            )
        )
      );
    }
  };

  // Company change
  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setSelectedCompany(value);
    setErrors((prev) => ({ ...prev, company: "" }));

    if (value) {
      const companyName = getCompanyName(value);

      const matched = activities.filter((item) =>
        item.assignedCompanies.includes(companyName)
      );

      setSelectedActivities(matched);
    } else {
      setSelectedActivities([]);
    }
  };

  // Submit
  const handleAssign = () => {
    let newErrors = { company: "", activity: "" };

    if (!selectedCompany) {
      newErrors.company = "Please select a company";
    }

    if (!selectedActivities.length) {
      newErrors.activity = "Please select at least one activity";
    }

    setErrors(newErrors);

    if (newErrors.company || newErrors.activity) return;

    const companyName = getCompanyName(selectedCompany);

    // Payload
    const assignActivity = {
      companyId: Number(selectedCompany),
      activityIds: selectedActivities.map((a) => a.activityId),
    };

    console.log("Payload:", assignActivity);

    // Update UI
    const updatedActivities = activities.map((act) => {
      if (
        selectedActivities.some(
          (a) => a.activityId === act.activityId
        )
      ) {
        const alreadyExists =
          act.assignedCompanies.includes(companyName);

        return {
          ...act,
          assignedCompanies: alreadyExists
            ? act.assignedCompanies
            : [...act.assignedCompanies, companyName],
          status: "Assigned",
        };
      }
      return act;
    });

    setActivities(updatedActivities);
  };

  return (
    <Container fluid className="mt-3">
      <Row>
        {/* Company */}
        <Col md={12} className="mb-3">
          <select
            className={`form-select ${
              errors.company ? "is-invalid" : ""
            }`}
            value={selectedCompany}
            onChange={handleCompanyChange}
          >
            <option value="">Select Company</option>
            {companylist.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.companyName}
              </option>
            ))}
          </select>
          {errors.company && (
            <div className="invalid-feedback d-block">
              {errors.company}
            </div>
          )}
        </Col>

        {/* Activity dropdown */}
        <Col md={9}>
          <div className="position-relative" ref={ref}>
            <div
              className={`form-control d-flex justify-content-between ${
                errors.activity ? "border-danger" : ""
              }`}
              onClick={() => setOpen(!open)}
              style={{ cursor: "pointer" }}
            >
              <span>
                {selectedActivities.length
                  ? selectedActivities
                      .map((a) => a.activityName)
                      .join(", ")
                  : "Select Activities"}
              </span>
              ▼
            </div>

            {open && (
              <div className="position-absolute bg-white border w-100 mt-1 shadow">
                <div className="p-2 border-bottom">
                  <input
                    className="form-control"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>

                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) =>
                              handleSelectAll(e.target.checked)
                            }
                          />
                        </th>
                        <th colSpan="6">
                          <div className="d-flex justify-content-between">
                            <span>Select All</span>
                            <span>
                              {selectedActivities.length} selected
                            </span>
                          </div>
                        </th>
                      </tr>

                      <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Companies</th>
                        <th>Start</th>
                        <th>End</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredData.length ? (
                        filteredData.map((item) => {
                          const checked =
                            selectedActivities.some(
                              (i) =>
                                i.activityId === item.activityId
                            );

                          return (
                            <tr key={item.activityId}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    handleToggle(item)
                                  }
                                />
                              </td>
                              <td>{item.activityId}</td>
                              <td
                                onClick={() =>
                                  handleToggle(item)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {item.activityName}
                              </td>
                              <td>{item.status}</td>
                              <td>
                                {item.assignedCompanies.join(
                                  ", "
                                ) || "—"}
                              </td>
                              <td>
                                {formatDate(
                                  item.startDate
                                )}
                              </td>
                              <td>
                                {formatDate(item.endDate)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {errors.activity && (
            <div className="text-danger mt-1">
              {errors.activity}
            </div>
          )}
        </Col>

        {/* Button */}
        <Col md={3}>
          <Button onClick={handleAssign}>
            Assign Activity
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;




