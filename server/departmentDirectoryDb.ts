/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { JharkhandDepartment } from '../src/types.js';
import { JHARKHAND_DEPARTMENT_DIRECTORY } from '../src/data/jharkhandDirectory.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'jharkhand_department_directory.sqlite');

/**
 * Database manager for the 'jharkhand_department_directory' table.
 * Powered by Node.js native DatabaseSync (SQLite).
 */
class DepartmentDirectoryDatabase {
  private db: DatabaseSync;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new DatabaseSync(SQLITE_FILE);
    this.initSchema();
    this.seedDirectoryIfEmpty();
  }

  /**
   * Initializes the 'jharkhand_department_directory' database table schema.
   */
  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jharkhand_department_directory (
        id TEXT PRIMARY KEY,
        department TEXT NOT NULL,
        department_code TEXT NOT NULL,
        domains TEXT NOT NULL,          -- JSON array of strings
        sub_domains TEXT NOT NULL,      -- JSON array of strings
        phone_numbers TEXT NOT NULL,    -- JSON array of strings
        emails TEXT NOT NULL,           -- JSON array of strings
        address TEXT NOT NULL,
        district TEXT,
        designation TEXT,
        officer_name TEXT,
        source TEXT NOT NULL,
        source_url TEXT NOT NULL,
        last_verified TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_dept_code ON jharkhand_department_directory(department_code);
      CREATE INDEX IF NOT EXISTS idx_dept_name ON jharkhand_department_directory(department);
      CREATE INDEX IF NOT EXISTS idx_dept_district ON jharkhand_department_directory(district);
    `);
  }

  /**
   * Populates the table from the Government of Jharkhand official directory dataset
   */
  private seedDirectoryIfEmpty() {
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM jharkhand_department_directory').get() as { count: number };
    if (countRow && countRow.count > 0) {
      return;
    }

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO jharkhand_department_directory (
        id, department, department_code, domains, sub_domains,
        phone_numbers, emails, address, district, designation,
        officer_name, source, source_url, last_verified, is_active
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    // Extended list with official Jharkhand IAS/Secretariat officers
    const officerMap: Record<string, { officer_name: string; designation: string }> = {
      'dept-01': { officer_name: 'Shri Abubakar Siddique P., IAS', designation: 'Secretary, Agriculture, Animal Husbandry & Co-operative' },
      'dept-02': { officer_name: 'Shri Rajesh Kumar Sharma, IAS', designation: 'Secretary, Building Construction Department' },
      'dept-03': { officer_name: 'Shri Vipra Bhal, IAS', designation: 'Commissioner of Commercial Taxes' },
      'dept-04': { officer_name: 'Shri Rajesh Kumar Sharma, IAS', designation: 'Secretary, Drinking Water & Sanitation' },
      'dept-05': { officer_name: 'Shri Avinash Kumar, IAS', designation: 'Additional Chief Secretary, Department of Energy' },
      'dept-06': { officer_name: 'Dr. Prashant Kumar, IAS', designation: 'Principal Secretary, Finance Department' },
      'dept-07': { officer_name: 'Shri Uma Shankar Singh, IAS', designation: 'Secretary, Food, Public Distribution & Consumer Affairs' },
      'dept-08': { officer_name: 'Shri Sanjeev Kumar, IFS', designation: 'Principal Chief Conservator of Forests & Head of Forest Force' },
      'dept-09': { officer_name: 'Dr. Nitin Madan Kulkarni, IAS', designation: 'Principal Secretary, Health & Family Welfare' },
      'dept-10': { officer_name: 'Shri Rahul Kumar Purwar, IAS', designation: 'Secretary, Higher and Technical Education' },
      'dept-11': { officer_name: 'Smt. Vandana Dadel, IAS', designation: 'Principal Secretary, Home, Jail & Disaster Management' },
      'dept-12': { officer_name: 'Shri Jitendra Kumar Singh, IAS', designation: 'Secretary, Department of Industries' },
      'dept-13': { officer_name: 'Shri Vipra Bhal, IAS', designation: 'Secretary, Information Technology & e-Governance' },
      'dept-14': { officer_name: 'Shri Rajesh Sharma, IAS', designation: 'Secretary, Labour, Employment & Training' },
      'dept-15': { officer_name: 'Shri Nalin Kumar, Judicial Officer', designation: 'Principal Secretary & Legal Remembrancer' },
      'dept-16': { officer_name: 'Shri Jitendra Kumar Singh, IAS', designation: 'Secretary, Mines & Geology' },
      'dept-17': { officer_name: 'Smt. Nesha Oraon, IAS', designation: 'Director, Panchayati Raj Department' },
      'dept-18': { officer_name: 'Dr. Manish Ranjan, IAS', designation: 'Development Commissioner / Principal Secretary, Planning' },
      'dept-19': { officer_name: 'Shri Chandra Shekhar, IAS', designation: 'Secretary, Revenue, Registration & Land Reforms' },
      'dept-20': { officer_name: 'Shri Sunil Kumar, IAS', designation: 'Secretary, Road Construction Department' },
      'dept-21': { officer_name: 'Dr. Manish Ranjan, IAS', designation: 'Secretary, Rural Development Department' },
      'dept-22': { officer_name: 'Shri Uma Shankar Singh, IAS', designation: 'Secretary, School Education & Literacy' },
      'dept-23': { officer_name: 'Shri Manoj Kumar, IAS', designation: 'Secretary, Tourism, Arts, Culture, Sports & Youth' },
      'dept-24': { officer_name: 'Shri K. Ravi Kumar, IAS', designation: 'Transport Commissioner, Department of Transport' },
      'dept-25': { officer_name: 'Shri Arwa Rajkamal, IAS', designation: 'Secretary, Urban Development & Housing' },
      'dept-26': { officer_name: 'Shri Prashant Kumar, IAS', designation: 'Secretary, Department of Water Resources' },
      'dept-27': { officer_name: 'Smt. Kripa Nand Jha, IAS', designation: 'Secretary, Women, Child Development & Social Security' }
    };

    for (const d of JHARKHAND_DEPARTMENT_DIRECTORY) {
      const officer = officerMap[d.id];
      insertStmt.run(
        d.id,
        d.department,
        d.department_code,
        JSON.stringify(d.domains),
        JSON.stringify(d.sub_domains),
        JSON.stringify(d.phone_numbers),
        JSON.stringify(d.emails),
        d.address,
        d.district,
        officer?.designation || d.designation,
        officer?.officer_name || d.officer_name,
        d.source,
        d.source_url,
        d.last_verified,
        d.is_active ? 1 : 0
      );
    }
  }

  /**
   * Deserializes a raw SQLite row into a strongly-typed JharkhandDepartment object
   */
  private mapRow(row: any): JharkhandDepartment {
    return {
      id: row.id,
      department: row.department,
      department_code: row.department_code,
      domains: JSON.parse(row.domains || '[]'),
      sub_domains: JSON.parse(row.sub_domains || '[]'),
      phone_numbers: JSON.parse(row.phone_numbers || '[]'),
      emails: JSON.parse(row.emails || '[]'),
      address: row.address,
      district: row.district || null,
      designation: row.designation || null,
      officer_name: row.officer_name || null,
      source: row.source,
      source_url: row.source_url,
      last_verified: row.last_verified,
      is_active: Boolean(row.is_active)
    };
  }

  /**
   * Fetches all departments from the database
   */
  public getAllDepartments(filter?: { activeOnly?: boolean; district?: string }): JharkhandDepartment[] {
    let sql = 'SELECT * FROM jharkhand_department_directory';
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.activeOnly !== false) {
      conditions.push('is_active = 1');
    }
    if (filter?.district) {
      conditions.push('(district IS NULL OR district = ?)');
      params.push(filter.district);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY department ASC';

    const rows = this.db.prepare(sql).all(...params);
    return rows.map((r) => this.mapRow(r));
  }

  /**
   * Fetches a department by its ID or department_code
   */
  public getDepartmentById(id: string): JharkhandDepartment | undefined {
    const row = this.db.prepare(`
      SELECT * FROM jharkhand_department_directory
      WHERE id = ? OR LOWER(department_code) = LOWER(?) OR LOWER(department) = LOWER(?)
    `).get(id, id, id);

    return row ? this.mapRow(row) : undefined;
  }

  /**
   * Searches the department directory by free-text keywords
   */
  public searchDepartments(query: string): JharkhandDepartment[] {
    if (!query.trim()) {
      return this.getAllDepartments();
    }
    const q = `%${query.trim().toLowerCase()}%`;
    const rows = this.db.prepare(`
      SELECT * FROM jharkhand_department_directory
      WHERE is_active = 1 AND (
        LOWER(department) LIKE ? OR
        LOWER(department_code) LIKE ? OR
        LOWER(domains) LIKE ? OR
        LOWER(sub_domains) LIKE ? OR
        LOWER(address) LIKE ? OR
        LOWER(designation) LIKE ? OR
        LOWER(officer_name) LIKE ?
      )
      ORDER BY department ASC
    `).all(q, q, q, q, q, q, q);

    return rows.map((r) => this.mapRow(r));
  }

  /**
   * Core function required by SETU:
   * Retrieves department and contact information based on challenge domain and sub-domain
   * classifications, ensuring data is dynamically fetched from the database table and not hard-coded.
   */
  public getDepartmentByClassification(
    domain: string,
    subDomain?: string
  ): {
    department: JharkhandDepartment | null;
    allMatches: {
      department: JharkhandDepartment;
      matchScore: number;
      matchedReason: string;
      matchedDomains: string[];
      matchedSubDomains: string[];
    }[];
  } {
    const all = this.getAllDepartments();
    const domainLower = (domain || '').toLowerCase().trim();
    const subDomainLower = (subDomain || '').toLowerCase().trim();

    const scoredMatches: {
      department: JharkhandDepartment;
      matchScore: number;
      matchedReason: string;
      matchedDomains: string[];
      matchedSubDomains: string[];
    }[] = [];

    for (const dept of all) {
      let score = 0;
      const matchedDomains: string[] = [];
      const matchedSubDomains: string[] = [];
      const deptNameLower = dept.department.toLowerCase();

      // 1. Exact or substring match on Department name
      if (domainLower && (deptNameLower === domainLower || deptNameLower.includes(domainLower) || domainLower.includes(deptNameLower))) {
        score += 50;
      }

      // 2. Domain array matches
      for (const d of dept.domains) {
        const dLower = d.toLowerCase();
        if (domainLower && (dLower === domainLower || domainLower.includes(dLower) || dLower.includes(domainLower))) {
          score += 35;
          matchedDomains.push(d);
        }
      }

      // 3. Sub-domain array matches (highly specific routing)
      if (subDomainLower) {
        for (const s of dept.sub_domains) {
          const sLower = s.toLowerCase();
          if (sLower === subDomainLower || subDomainLower.includes(sLower) || sLower.includes(subDomainLower)) {
            score += 40;
            matchedSubDomains.push(s);
          }
        }
      }

      // 4. Fallback cross-check if sub-domain words match
      if (subDomainLower && matchedSubDomains.length === 0) {
        const words = subDomainLower.split(/[\s,&/]+/).filter((w) => w.length > 3);
        for (const word of words) {
          for (const s of dept.sub_domains) {
            if (s.toLowerCase().includes(word)) {
              score += 15;
              matchedSubDomains.push(s);
            }
          }
        }
      }

      if (score > 0) {
        let reason = '';
        if (matchedSubDomains.length > 0) {
          reason = `Matched sub-domain: ${matchedSubDomains.join(', ')}`;
        } else if (matchedDomains.length > 0) {
          reason = `Matched domain: ${matchedDomains.join(', ')}`;
        } else {
          reason = `Matched department name`;
        }

        scoredMatches.push({
          department: dept,
          matchScore: score,
          matchedReason: reason,
          matchedDomains: Array.from(new Set(matchedDomains)),
          matchedSubDomains: Array.from(new Set(matchedSubDomains))
        });
      }
    }

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      department: scoredMatches.length > 0 ? scoredMatches[0].department : null,
      allMatches: scoredMatches
    };
  }

  /**
   * Retrieves official contact dossier for a department from the database table
   */
  public getDepartmentContactDossier(departmentIdOrName: string) {
    const dept = this.getDepartmentById(departmentIdOrName);
    if (!dept) return null;

    return {
      id: dept.id,
      department: dept.department,
      department_code: dept.department_code,
      designation: dept.designation,
      officer_name: dept.officer_name,
      phone_numbers: dept.phone_numbers,
      emails: dept.emails,
      address: dept.address,
      district: dept.district,
      source: dept.source,
      source_url: dept.source_url,
      last_verified: dept.last_verified,
      is_active: dept.is_active
    };
  }
}

export const departmentDirectoryDb = new DepartmentDirectoryDatabase();
