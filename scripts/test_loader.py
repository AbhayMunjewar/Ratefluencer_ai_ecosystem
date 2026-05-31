"""Quick test: verify dataset_loader works with the CSV files."""
from backend.services.dataset_loader import load_instagram_influencers, load_tiktok_influencers

ig = load_instagram_influencers()
tt = load_tiktok_influencers()

print(f"Instagram: {len(ig)} rows")
print(f"TikTok: {len(tt)} rows")
print()

print("=== Instagram Top 15 ===")
for d in ig[:15]:
    print(f"  {d['id']:6}  {d['name'][:30]:30}  {d['handle'][:25]:25}  followers={d['followers']:>12,}  country={d['country']}")

print()
print("=== TikTok Top 10 ===")
for d in tt[:10]:
    print(f"  {d['id']:6}  {d['name'][:30]:30}  {d['handle'][:25]:25}  followers={d['followers']:>12,}")

# Test specific: Virat Kohli should be ig_9
virat = [x for x in ig if "virat" in x.get("name", "").lower() or "virat" in x.get("handle", "").lower()]
print()
if virat:
    v = virat[0]
    print(f"FOUND Virat Kohli: id={v['id']} name={v['name']} handle={v['handle']} followers={v['followers']:,}")
else:
    print("ERROR: Virat Kohli NOT found in Instagram dataset!")
