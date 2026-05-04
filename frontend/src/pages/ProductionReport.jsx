import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO, isValid } from 'date-fns';
import { AlertCircle, CalendarDays, Download, Loader2, Printer } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EGGS_PER_TRAY = 30;
const today = format(new Date(), 'yyyy-MM-dd');
const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

const getTrayCount = (value) => Math.floor((Number(value) || 0) / EGGS_PER_TRAY);

const getOddEggCount = (record) => (
  (Number(record.bunkig) || 0) +
  [record.jumbo, record.extralarge, record.large, record.medium, record.small, record.peewee]
    .reduce((sum, value) => sum + ((Number(value) || 0) % EGGS_PER_TRAY), 0)
);

const getRecordTotalTrays = (record) => (
  ['jumbo', 'extralarge', 'large', 'medium', 'small', 'peewee'].reduce((sum, field) => sum + getTrayCount(record[field]), 0)
);

const formatFlockReference = (record, flock) => {
  if (!flock) {
    return `Flock #${record.flockId}`;
  }

  const parts = [flock.house, flock.batchId].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : `Flock #${record.flockId}`;
};

const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const ProductionReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rangeType, setRangeType] = useState('daily');
  const [referenceDate, setReferenceDate] = useState(today);
  const [customStartDate, setCustomStartDate] = useState(weekStart);
  const [customEndDate, setCustomEndDate] = useState(today);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [productionRecords, flocks, feedRecords] = await Promise.all([
        api.production.getAll(),
        api.flocks.getAll(),
        api.feed.getAll()
      ]);

      const flockMap = flocks.reduce((acc, flock) => {
        acc[String(flock.id)] = flock;
        return acc;
      }, {});

      const feedByDateAndFlock = feedRecords.reduce((acc, feedRecord) => {
        const key = `${feedRecord.date}::${String(feedRecord.flockId)}`;
        acc[key] = (acc[key] || 0) + (Number(feedRecord.feedConsumedKgs) || 0);
        return acc;
      }, {});

      const mappedRows = productionRecords
        .map((record) => {
          const flock = flockMap[String(record.flockId)];
          const feedKey = `${record.date}::${String(record.flockId)}`;

          return {
            id: record.id,
            date: record.date,
            flockReference: formatFlockReference(record, flock),
            noOfHens: Number(record.henCount ?? flock?.quantity) || 0,
            mortality: Number(record.mortality) || 0,
            jumbo: getTrayCount(record.jumbo),
            extralarge: getTrayCount(record.extralarge),
            large: getTrayCount(record.large),
            medium: getTrayCount(record.medium),
            small: getTrayCount(record.small),
            peewee: getTrayCount(record.peewee),
            totalTrays: getRecordTotalTrays(record),
            oddEggs: getOddEggCount(record),
            cracked: Number(record.cracked) || 0,
            reject: Number(record.reject) || 0,
            feedConsumed: feedByDateAndFlock[feedKey] || 0,
            remarks: record.notes || ''
          };
        })
        .sort((a, b) => {
          if (a.date === b.date) {
            return b.id - a.id;
          }
          return b.date.localeCompare(a.date);
        });

      setRows(mappedRows);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load production report data.');
    } finally {
      setLoading(false);
    }
  };

  const getRangeBounds = () => {
    if (rangeType === 'custom') {
      const start = parseISO(customStartDate);
      const end = parseISO(customEndDate);
      return {
        start,
        end,
        valid: isValid(start) && isValid(end) && start.getTime() <= end.getTime()
      };
    }

    const parsedReferenceDate = parseISO(referenceDate);
    if (!isValid(parsedReferenceDate)) {
      return { start: null, end: null, valid: false };
    }

    if (rangeType === 'weekly') {
      return {
        start: startOfWeek(parsedReferenceDate),
        end: endOfWeek(parsedReferenceDate),
        valid: true
      };
    }

    if (rangeType === 'monthly') {
      return {
        start: startOfMonth(parsedReferenceDate),
        end: endOfMonth(parsedReferenceDate),
        valid: true
      };
    }

    return {
      start: parsedReferenceDate,
      end: parsedReferenceDate,
      valid: true
    };
  };

  const rangeBounds = getRangeBounds();
  const hasInvalidRange = !rangeBounds.valid;

  const filteredRows = hasInvalidRange
    ? []
    : rows.filter((row) => {
        const parsedRowDate = parseISO(row.date);
        if (!isValid(parsedRowDate)) {
          return false;
        }

        const rowTime = parsedRowDate.getTime();
        return rowTime >= rangeBounds.start.getTime() && rowTime <= rangeBounds.end.getTime();
      });

  const totalFeedConsumed = filteredRows.reduce((sum, row) => sum + row.feedConsumed, 0);

  const rangeLabel = hasInvalidRange
    ? 'Invalid date range'
    : `${format(rangeBounds.start, 'MMM dd, yyyy')} to ${format(rangeBounds.end, 'MMM dd, yyyy')}`;

  const exportCsv = () => {
    if (hasInvalidRange || filteredRows.length === 0) {
      return;
    }

    const headers = [
      'Date',
      'Flock Reference',
      'No. of Hens',
      'Mortality',
      'J Trays',
      'ExL Trays',
      'L Trays',
      'M Trays',
      'S Trays',
      'P Trays',
      'Total Trays',
      'ODD Eggs',
      'Cracked',
      'Reject',
      'Feed Consumed (kg)',
      'Remarks'
    ];

    const csvRows = filteredRows.map((row) => ([
      row.date,
      row.flockReference,
      row.noOfHens,
      row.mortality,
      row.jumbo,
      row.extralarge,
      row.large,
      row.medium,
      row.small,
      row.peewee,
      row.totalTrays,
      row.oddEggs,
      row.cracked,
      row.reject,
      row.feedConsumed.toFixed(2),
      row.remarks
    ]).map(escapeCsvValue).join(','));

    const csvContent = `data:text/csv;charset=utf-8,${[headers.join(','), ...csvRows].join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `production_report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPdf = () => {
    if (!hasInvalidRange) {
      window.print();
    }
  };

  return (
    <div className="page-container" id="printable-area">
      <div className="page-header">
        <div>
          <h2>Production Report</h2>
          <p className="page-subtitle">Review staff production output by date range and export the filtered report.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button className="btn-secondary" onClick={exportCsv} disabled={filteredRows.length === 0 || hasInvalidRange}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-secondary" onClick={printPdf} disabled={hasInvalidRange}>
            <Printer size={18} /> Print PDF
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="card no-print">
        <div style={{ display: 'grid', gridTemplateColumns: rangeType === 'custom' ? 'repeat(auto-fit, minmax(140px, 1fr))' : '1fr 1fr', gap: '16px', width: '100%' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label>Report Range</label>
            <select value={rangeType} onChange={(event) => setRangeType(event.target.value)} style={{ width: '100%', minWidth: 0 }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {rangeType !== 'custom' ? (
            <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
              <label>{rangeType === 'daily' ? 'Date' : rangeType === 'weekly' ? 'Week Reference' : 'Month Reference'}</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(event) => setReferenceDate(event.target.value)}
                style={{ width: '100%', minWidth: 0 }}
              />
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {hasInvalidRange && (
        <div className="alert alert-warning">
          <AlertCircle size={18} /> Please choose a valid date range before viewing the report.
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <h3 className="section-title" style={{ marginBottom: '6px' }}>
              <CalendarDays size={18} /> Filtered Production Rows
            </h3>
            <p className="text-sm text-muted">{rangeLabel}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)' }}>
              <div className="text-xs text-muted">Records</div>
              <div className="font-semibold">{filteredRows.length.toLocaleString()}</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)' }}>
              <div className="text-xs text-muted">Feed Consumed</div>
              <div className="font-semibold">{totalFeedConsumed.toFixed(2)} kg</div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table card-table-mobile">
            <thead>
              <tr>
                <th>Date</th>
                <th>Flock Reference</th>
                <th className="text-right">No. of Hens</th>
                <th className="text-right">Mortality</th>
                <th className="text-right">J</th>
                <th className="text-right">ExL</th>
                <th className="text-right">L</th>
                <th className="text-right">M</th>
                <th className="text-right">S</th>
                <th className="text-right">P</th>
                <th className="text-right">Total Trays</th>
                <th className="text-right">ODD</th>
                <th className="text-right">Cracked</th>
                <th className="text-right">Reject</th>
                <th className="text-right">Feed Consumed (kg)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No production records found for the selected range.
                  </td>
                </tr>
              ) : filteredRows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Date">{row.date}</td>
                  <td data-label="Flock Ref" className="font-medium">{row.flockReference}</td>
                  <td data-label="Hens" className="text-right">{row.noOfHens.toLocaleString()}</td>
                  <td data-label="Mortality" className="text-right">{row.mortality.toLocaleString()}</td>
                  <td data-label="Jumbo" className="text-right">{row.jumbo.toLocaleString()}</td>
                  <td data-label="ExLarge" className="text-right">{row.extralarge.toLocaleString()}</td>
                  <td data-label="Large" className="text-right">{row.large.toLocaleString()}</td>
                  <td data-label="Medium" className="text-right">{row.medium.toLocaleString()}</td>
                  <td data-label="Small" className="text-right">{row.small.toLocaleString()}</td>
                  <td data-label="Peewee" className="text-right">{row.peewee.toLocaleString()}</td>
                  <td data-label="Total Trays" className="text-right font-medium" style={{ color: '#16a34a' }}>{row.totalTrays.toLocaleString()}</td>
                  <td data-label="Odd Eggs" className="text-right">{row.oddEggs.toLocaleString()}</td>
                  <td data-label="Cracked" className="text-right">{row.cracked.toLocaleString()}</td>
                  <td data-label="Reject" className="text-right">{row.reject.toLocaleString()}</td>
                  <td data-label="Feed (kg)" className="text-right">{row.feedConsumed.toFixed(2)}</td>
                  <td data-label="Remarks" className="text-sm text-muted">{row.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionReport;
