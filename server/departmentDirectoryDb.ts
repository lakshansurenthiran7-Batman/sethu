import type { JharkhandDepartment } from '../src/types.js';
import { db } from './db.js';

class DepartmentDirectoryDatabase {
  public getAllDepartments(filter?: { activeOnly?: boolean; district?: string }): JharkhandDepartment[] {
    return db.getDirectoryEntries().filter(d =>
      (filter?.activeOnly === false || d.is_active) &&
      (!filter?.district || !d.district || d.district === filter.district)
    ).sort((a, b) => a.department.localeCompare(b.department));
  }

  public getDepartmentById(id: string): JharkhandDepartment | undefined {
    const value = id.toLowerCase();
    return db.getDirectoryEntries().find(d =>
      d.id === id || d.department_code.toLowerCase() === value || d.department.toLowerCase() === value);
  }

  public searchDepartments(query: string): JharkhandDepartment[] {
    const value = query.trim().toLowerCase();
    return this.getAllDepartments().filter(d =>
      [d.department, d.department_code, ...d.domains, ...d.sub_domains, d.address, d.designation, d.officer_name]
        .some(field => field?.toLowerCase().includes(value)));
  }

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
