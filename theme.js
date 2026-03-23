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






-------------------------------------------------------------------------------------------------------------------------------

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "react-bootstrap";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ActivityCustomSelect = ({ data, setData, selectedCompany }) => {
  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const containerRef = useRef(null);

  const formik = useFormik({
    initialValues: { activities: [] },
    validate: (values) => {
      const errors = {};
      if (!values.activities.length) {
        errors.activities = "Select at least one activity";
      }
      return errors;
    },
    onSubmit: (values) => {
      if (!selectedCompany) {
        alert("Select company first");
        return;
      }

      setData((prev) =>
        prev.map((activity) => {
          const isSelected = values.activities.some(
            (a) => a.activityId === activity.activityId
          );

          if (!isSelected) return activity;

          const exists = activity.assignedCompanies.some(
            (c) => c.companyId === selectedCompany.companyId
          );

          return {
            ...activity,
            assignedCompanies: exists
              ? activity.assignedCompanies
              : [...activity.assignedCompanies, selectedCompany],
            status: "Assigned",
          };
        })
      );
    },
  });

  // ✅ Keep selection synced with latest data reference
  const selectedRows = data.filter((d) =>
    formik.values.activities.some(
      (s) => s.activityId === d.activityId
    )
  );

  // ✅ Auto-select rows when company changes
  useEffect(() => {
    if (!selectedCompany) {
      formik.setFieldValue("activities", []);
      return;
    }

    const selectedIds = new Set(
      data
        .filter((activity) =>
          activity.assignedCompanies.some(
            (c) => c.companyId === selectedCompany.companyId
          )
        )
        .map((a) => a.activityId)
    );

    const matchedRows = data.filter((d) =>
      selectedIds.has(d.activityId)
    );

    formik.setFieldValue("activities", matchedRows);
  }, [selectedCompany, data]);

  // outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setGlobalFilter("");
  }, [open]);

  // format date
  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const assignedCompaniesTemplate = (row) =>
    row.assignedCompanies?.length
      ? row.assignedCompanies.map((c) => c.companyName).join(", ")
      : "—";

  // ✅ FULL COLUMN SEARCH (optimized)
  const filteredData = useMemo(() => {
    const search = globalFilter.toLowerCase();

    return data.filter((item) => {
      const activityId = item.activityId?.toString() || "";
      const activityName = item.activityName?.toLowerCase() || "";
      const status = item.status?.toLowerCase() || "";

      const companies = item.assignedCompanies?.length
        ? item.assignedCompanies
            .map((c) => c.companyName.toLowerCase())
            .join(" ")
        : "";

      const startDate = item.startDate
        ? formatDate(item.startDate).toLowerCase()
        : "";

      const endDate = item.endDate
        ? formatDate(item.endDate).toLowerCase()
        : "";

      return (
        activityId.includes(search) ||
        activityName.includes(search) ||
        status.includes(search) ||
        companies.includes(search) ||
        startDate.includes(search) ||
        endDate.includes(search)
      );
    });
  }, [data, globalFilter]);

  // select all logic
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((item) =>
      selectedRows.some((s) => s.activityId === item.activityId)
    );

  const handleSelectAll = (checked) => {
    let newSelection;

    if (checked) {
      const ids = new Set([
        ...selectedRows.map((s) => s.activityId),
        ...filteredData.map((f) => f.activityId),
      ]);

      newSelection = data.filter((d) => ids.has(d.activityId));
    } else {
      newSelection = selectedRows.filter(
        (s) =>
          !filteredData.some((f) => f.activityId === s.activityId)
      );
    }

    formik.setFieldValue("activities", newSelection);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div ref={containerRef} style={{ position: "relative" }}>
        
        {/* Dropdown */}
        <div
          className="form-select"
          onClick={() => setOpen((prev) => !prev)}
        >
          {selectedRows.length
            ? selectedRows.map((r) => r.activityName).join(", ")
            : "Select Activities"}
        </div>

        {formik.errors.activities && (
          <div className="text-danger">{formik.errors.activities}</div>
        )}

        {/* Panel */}
        {open && (
          <div style={{ border: "1px solid #ccc", padding: 10 }}>
            
            {/* Search */}
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              style={{ width: "100%", marginBottom: 10 }}
            />

            {/* Select All + Count */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />{" "}
                Select All
              </div>

              <div>{selectedRows.length} selected</div>
            </div>

            {/* Table */}
            <DataTable
              value={filteredData}
              selection={selectedRows}
              onSelectionChange={(e) => {
                const ids = new Set(e.value.map((v) => v.activityId));
                const updated = data.filter((d) =>
                  ids.has(d.activityId)
                );
                formik.setFieldValue("activities", updated);
              }}
              dataKey="activityId"
            >
              <Column selectionMode="multiple" />
              <Column field="activityId" header="ID" />
              <Column field="activityName" header="Activity Name" />
              <Column header="Companies" body={assignedCompaniesTemplate} />
              <Column header="Start" body={(row) => formatDate(row.startDate)} />
              <Column header="End" body={(row) => formatDate(row.endDate)} />
            </DataTable>
          </div>
        )}
      </div>

      <Button type="submit" className="mt-2">
        Assign Activity
      </Button>
    </form>
  );
};

export default ActivityCustomSelect;











-----------------------------------------------------------------------------






import React, { useState } from "react";
import { Form } from "react-bootstrap";

const CustomDropdownTable = ({ companylist, onSelect }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleChange = (e) => {
    const companyId = Number(e.target.value);

    const selected = companylist.find(
      (c) => c.companyId === companyId
    );

    setSelectedCompany(selected);
    onSelect && onSelect(selected);
  };

  return (
    <Form.Select
      value={selectedCompany?.companyId || ""}
      onChange={handleChange}
    >
      <option value="">Select Company</option>

      {companylist.map((company) => (
        <option key={company.companyId} value={company.companyId}>
          {company.companyName}
        </option>
      ))}
    </Form.Select>
  );
};

export default CustomDropdownTable;




-----------------------------------------------------------------------------------



    import { useState } from "react";
import CustomDropdownTable from "./CustomDropdownTable";
import ActivityCustomSelect from "./ActivityCustomSelect";
import "bootstrap/dist/css/bootstrap.min.css";
import { Col, Row, Container } from "react-bootstrap";

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
      assignedCompanies: [
        { companyId: 3, companyName: "testing2" },
        { companyId: 5, companyName: "Strafford Construction Group" }
      ],
      startDate: "2026-01-16T08:00:00",
      endDate: "2026-01-16T17:00:00",
      status: "Assigned",
    },
  ];

  const companylist = [
    { companyId: 2, companyName: "contractar" },
    { companyId: 3, companyName: "testing2" },
    { companyId: 5, companyName: "Strafford Construction Group" },
  ];

  const [activities, setActivities] = useState(initialData);
  const [selectedCompany, setSelectedCompany] = useState(null);

  return (
    <Container fluid>
      <Row>
        <Col md={6}>
          <CustomDropdownTable
            companylist={companylist}
            onSelect={setSelectedCompany}
          />
        </Col>

        <Col md={6}>
          <ActivityCustomSelect
            data={activities}
            setData={setActivities}
            selectedCompany={selectedCompany}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
