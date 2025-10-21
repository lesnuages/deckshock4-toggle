{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_20
    pkgs.pnpm
    pkgs.nodePackages.typescript-language-server
    pkgs.zip
    pkgs.unzip
  ];

  shellHook = ''
    export NODE_ENV=development
    export PNPM_HOME="$PWD/.pnpm"
    export PATH="$PNPM_HOME:$PATH"
    mkdir -p "$PNPM_HOME"
  '';
}
