export async function executeListing(listingRequest) {
  const { platforms } = listingRequest;

  return platforms.map(platform => ({
    platform,
    success: true,
    message: 'Stubbed backend listing (no post performed)'
  }));
}
