import sys, json, math, datetime as dt
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'pylibs'))
import ephem, holidays
from korean_lunar_calendar import KoreanLunarCalendar

ROOT = Path(__file__).resolve().parents[1]
UTC = dt.timezone.utc
def longitude(t):
    sun = ephem.Sun(t)
    # Apparent geocentric coordinates, equinox of date, not J2000.
    eq = ephem.Equatorial(sun.g_ra, sun.g_dec, epoch=t)
    return math.degrees(float(ephem.Ecliptic(eq, epoch=t).lon)) % 360

terms=[]
for y in range(1899, 2057):
    for m in range(1,13):
        # The twelve jie (not zhongqi): Xiaohan=285°, Lichun=315°.
        target=(255+30*m)%360
        lo=float(ephem.Date(dt.datetime(y,m,1)))
        hi=lo+10
        for _ in range(40):
            mid=(lo+hi)/2
            delta=(longitude(ephem.Date(mid))-target+180)%360-180
            if delta<0: lo=mid
            else: hi=mid
        when=ephem.Date((lo+hi)/2).datetime().replace(tzinfo=UTC)
        terms.append([round(when.timestamp()*1000),m])

calendar=KoreanLunarCalendar()
lunar=[]
for y in range(1900,2051):
    for m in range(1,13):
        for leap in (False,True):
            if calendar.setLunarDate(y,m,1,leap) and calendar.isIntercalation == leap:
                start=calendar.SolarIsoFormat()
                length=30 if calendar.setLunarDate(y,m,30,leap) else 29
                lunar.append([y,m,int(leap),start,length])

kr=holidays.KR(years=range(2025,2057),language='ko')
data={'version':'4.1+unzip.1','generated':'2026-11-05','termMethod':'PyEphem 4.2.1 apparent geocentric solar longitude, epoch=date, binary search','terms':terms,'lunar':lunar,'holidays':{d.isoformat():name for d,name in sorted(kr.items())},'range':[1900,2050]}
(ROOT/'src/calendar.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
for ms,m in terms:
    date=dt.datetime.fromtimestamp(ms/1000,UTC)+dt.timedelta(hours=9)
    if date.year==2026: print(m,date.isoformat())
for y,m,d,expected in [(1949,10,1,0),(2000,1,1,54)]:
    jdn=(dt.date(y,m,d)-dt.date(1970,1,1)).days+2440588
    got=(jdn+49)%60
    assert got==expected,(y,got)
print('Two independent day anchors passed. Lunar months:',len(lunar),'Solar jie:',len(terms))
