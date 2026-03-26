/**
 * Shared utility for building ICP objects from the workshop state inputs.
 * Ensures consistent data extraction and validation across UI and API layers.
 */

export const buildIcp = (num: number, inputs: any) => {
  const roles = inputs[`icp${num}_roles`] as string[];
  const sizes = inputs[`icp${num}_sizes`] as string[];
  const industries = inputs[`icp${num}_industries`] as string[];
  
  const hasRoles = roles && roles.length > 0;
  const hasSizes = sizes && sizes.length > 0;
  const hasIndustries = industries && industries.length > 0;

  // STRICT VALIDATION: All 3 core fields must be present
  if (!hasRoles || !hasSizes || !hasIndustries) return null;
  
  const extractList = (list: string[], otherVal: string) => {
    if (list.includes('Other')) {
        const others = otherVal.split(',').map(s => s.trim()).filter(Boolean);
        return [...list.filter(item => item !== 'Other'), ...others];
    }
    return list;
  };

  return {
    roles: extractList(roles, inputs[`icp${num}_rolesOther`] || ""),
    sizes: extractList(sizes, inputs[`icp${num}_sizesOther`] || ""),
    industries: extractList(industries, inputs[`icp${num}_industriesOther`] || ""),
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
