/**
 * Shared utility for building ICP objects from the workshop state inputs.
 * Ensures consistent data extraction and validation across UI and API layers.
 */

export const buildIcp = (num: number, inputs: any) => {
  // SAFE ACCESS: Ensure inputs exists and fallback to empty arrays
  const rawRoles = inputs?.[`icp${num}_roles`] || [];
  const rawSizes = inputs?.[`icp${num}_sizes`] || [];
  const rawIndustries = inputs?.[`icp${num}_industries`] || [];
  
  const extractList = (list: string[], otherVal: string) => {
    if (!list || !Array.isArray(list)) return [];
    
    // Merge "Other" values if selected OR if "Other" value exists (User's request for robust merging)
    if (list.includes('Other') || otherVal.trim().length > 0) {
        const others = otherVal.split(',').map(s => s.trim()).filter(Boolean);
        const filteredList = list.filter(item => item !== 'Other');
        // Return unique values
        return Array.from(new Set([...filteredList, ...others]));
    }
    return list;
  };

  const roles = extractList(rawRoles, inputs?.[`icp${num}_rolesOther`] || "");
  const sizes = extractList(rawSizes, inputs?.[`icp${num}_sizesOther`] || "");
  const industries = extractList(rawIndustries, inputs?.[`icp${num}_industriesOther`] || "");

  // STRICT VALIDATION: At least roles must be present to be a valid profile
  if (!roles.length && !sizes.length && !industries.length) return null;
  
  return {
    roles,
    sizes,
    industries,
  };
};

/**
 * Normalizes input arrays into readable strings for prompts
 */
export const normalizeInputList = (list: string[], otherVal?: string) => {
    if (!list || list.length === 0) return "";
    if (list.includes('Other') && otherVal) {
        const others = otherVal.split(',').map(s => s.trim()).filter(Boolean);
        return [...list.filter(item => item !== 'Other'), ...others].join(', ');
    }
    return list.join(', ');
};
