import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Expand compact enums: enum Name { VAL1 VAL2 VAL3 }
def expand_enum(match):
    name = match.group(1)
    values = match.group(2).strip().split()
    expanded = f"enum {name} {{\n"
    for val in values:
        expanded += f"  {val}\n"
    expanded += "}"
    return expanded

# Match compact single-line enums
content = re.sub(r'enum\s+(\w+)\s*\{\s*([A-Z_\s]+)\s*\}', expand_enum, content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("✅ Schema formatted successfully")
