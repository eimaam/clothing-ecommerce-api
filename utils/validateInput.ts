export function validateInputData(
    data: Record<string, string | undefined>
  ): boolean {
    for (const key in data) {
      if (data[key]) {
        if (
          data[key] === undefined ||
          data[key] === null ||
          data[key]?.trim() === ""
        ) {
          return false;
        }
      }
    }
    return true;
  }